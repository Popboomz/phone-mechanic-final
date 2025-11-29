
import type { Customer } from "./types";
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

interface RepairItemNode {
  id: string;
  label: string;
  children?: RepairItemNode[];
}

const repairData: RepairItemNode[] = [
  {
    id: 'none',
    label: 'None',
  },
  {
    id: 'screen_repair',
    label: 'Screen Repair',
    children: [
      {
        id: 'aftermaket_incell',
        label: 'aftermaket incell',
        children: [
          { id: 'incell_80_90hz', label: '80-90hz' },
          { id: 'incell_120hz', label: '120hz' },
          { id: 'standard_aftermaket_incell', label: 'standard aftermaket' },
        ],
      },
      {
        id: 'aftermaket_hard',
        label: 'aftermaket hard',
        children: [
          { id: 'hard_80_90hz', label: '80-90hz' },
          { id: 'hard_120hz', label: '120hz' },
          { id: 'standard_aftermaket_hard', label: 'standard aftermaket' },
        ],
      },
      { id: 'aftermaket_soft_120hz', label: 'aftermaket soft 120hz' },
      { id: 'service_pack', label: 'service pack' },
      { id: 'oem', label: 'oem' },
    ],
  },
  {
    id: 'accessory_repair',
    label: 'Accessory Repair',
    children: [
      {
        id: 'camera',
        label: 'camera',
        children: [
          { id: 'front_camera', label: 'front' },
          { id: 'rear_camera', label: 'rear' },
        ],
      },
      { 
        id: 'charging_port', 
        label: 'charging port',
        children: [
            { id: 'microphone', label: 'microphone' },
            { id: 'barometer', label: 'barometer' },
        ]
      },
      {
        id: 'sensor',
        label: 'sensor',
        children: [
          { id: 'wifi', label: 'wifi' },
          { id: 'bluetooth', label: 'bluetooth' },
          { id: 'light', label: 'light' },
        ],
      },
      {
        id: 'battery',
        label: 'battery',
        children: [
          { id: 'aftermaket_battery', label: 'aftermaket' },
          { id: 'sp_battery', label: 'sp' },
        ],
      },
      {
        id: 'glass',
        label: 'glass',
        children: [
          { id: 'back_glass', label: 'back' },
          { id: 'camera_glass', label: 'camera' },
        ],
      },
      {
        id: 'speaker',
        label: 'speaker',
        children: [
            { id: 'loud_speaker', label: 'loud' },
            { id: 'front_speaker', label: 'front' },
        ]
      }
    ],
  },
];


const getParentChain = (id: string, nodes: RepairItemNode[]): string[] => {
    for(const node of nodes) {
        if(node.id === id) return [node.label];
        if(node.children) {
            const childResult = getParentChain(id, node.children);
            if(childResult.length > 0) return [node.label, ...childResult];
        }
    }
    return [];
};


export const getFullLabelPathForRepairItem = (id: string): string => {
    if (!id) return '';
    if (id === 'none') return 'None';
    const chain = getParentChain(id, repairData);
    return chain.join(' > ');
};


const customersCollection = collection(db, 'customers');

const cleanUndefined = (obj: any) => {
  const out: any = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
};

// Helper to convert Firestore doc to Customer object
const fromFirestore = (doc: any): Customer => {
    const data = doc.data();
    const repairItems = Array.isArray(data.repairItems)
      ? data.repairItems
      : data.repairItem
      ? [data.repairItem]
      : [];

    return {
        id: doc.id,
        ...data,
        transactionDate: (data.transactionDate as Timestamp).toDate(),
        deletedAt: data.deletedAt ? (data.deletedAt as Timestamp).toDate() : null,
        repairItems,
        policyType: data.policyType || undefined,
        policyText: data.policyText || undefined,
        notes: data.notes || '',
    };
}

const getAllCustomers = async (): Promise<Customer[]> => {
    const q = query(customersCollection, where('deletedAt', '==', null));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
}

export const searchCustomers = async (
  searchQuery: string,
  limitCount?: number
): Promise<Customer[]> => {
  const allCustomers = await getAllCustomers();

  // 没有搜索词：按日期倒序返回
  if (!searchQuery) {
    const sorted = allCustomers.sort(
      (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()
    );
    return limitCount ? sorted.slice(0, limitCount) : sorted;
  }

  const lowerCaseQuery = searchQuery.toLowerCase();
  const numericQuery = searchQuery.replace(/\D/g, ""); // 去掉非数字，用于电话/IMEI

  let scoredCustomers = allCustomers
    .map((customer) => {
      let score = 0;

      const lowerCaseName = customer.customerName.toLowerCase();
      const lowerCaseModel = customer.phoneModel.toLowerCase();
      const lowerCaseImei = (customer.phoneImei || "").toLowerCase();
      const lowerCasePrice = customer.phonePrice.toLowerCase();
      const lowerCasePhone = (customer.phoneNumber || "").toLowerCase();
      const digitsPhone = (customer.phoneNumber || "").replace(/\D/g, "");

      const repairItemPath = (customer.repairItems || [])
        .map((id) => (id.startsWith('custom:') ? id.slice(7) : getFullLabelPathForRepairItem(id)))
        .join(' | ')
        .toLowerCase();
      const notes = (customer.notes || "").toLowerCase();

      const transactionDate = customer.transactionDate;
      const dateString = transactionDate.toLocaleDateString("en-CA"); // YYYY-MM-DD

      // ======= 权重规则开始 =======

      // 1. 电话号码（含尾号）—— 数字匹配
      if (numericQuery) {
        // 完整匹配
        if (digitsPhone === numericQuery) score += 110;

        // 尾号匹配（至少 3 位）
        if (
          numericQuery.length >= 3 &&
          digitsPhone.endsWith(numericQuery)
        ) {
          score += 90;
        }

        // 部分包含
        if (digitsPhone.includes(numericQuery)) {
          score += 35;
        }
      }

      // 2. IMEI 精确 / 模糊
      if (lowerCaseImei === lowerCaseQuery) score += 120;
      if (lowerCaseImei.includes(lowerCaseQuery)) score += 40;

      // 3. 客户姓名
      if (lowerCaseName === lowerCaseQuery) score += 80;
      if (lowerCaseName.includes(lowerCaseQuery)) score += 25;

      // 4. 型号
      if (lowerCaseModel === lowerCaseQuery) score += 40;
      if (lowerCaseModel.includes(lowerCaseQuery)) score += 15;

      // 5. 维修项目（用 label path）
      if (repairItemPath.includes(lowerCaseQuery)) score += 20;

      // 6. 备注
      if (notes.includes(lowerCaseQuery)) score += 10;

      // 7. 价格（字符串匹配）
      if (lowerCasePrice === lowerCaseQuery) score += 50;
      if (lowerCasePrice.includes(lowerCaseQuery)) score += 5;

      // 8. 日期搜索（支持 2025-11-28 / 28/11/2025 等）
      try {
        // 尝试按原字符串 new Date
        const queryDate = new Date(searchQuery);
        if (!isNaN(queryDate.getTime())) {
          // 同一天
          if (
            transactionDate.getFullYear() === queryDate.getFullYear() &&
            transactionDate.getMonth() === queryDate.getMonth() &&
            transactionDate.getDate() === queryDate.getDate()
          ) {
            score += 50;
          }
        }
      } catch {
        // 忽略解析失败
      }

      // 直接用 YYYY-MM-DD 字符串包含判断
      if (dateString.includes(lowerCaseQuery)) {
        score += 10;
      }

      if (numericQuery.length === 8) {
        const d = parseInt(numericQuery.slice(0, 2), 10);
        const m = parseInt(numericQuery.slice(2, 4), 10) - 1;
        const y = parseInt(numericQuery.slice(4, 8), 10);
        const qd = new Date(y, m, d);
        if (
          !isNaN(qd.getTime()) &&
          transactionDate.getFullYear() === qd.getFullYear() &&
          transactionDate.getMonth() === qd.getMonth() &&
          transactionDate.getDate() === qd.getDate()
        ) {
          score += 70;
        }
      }

      // ======= 权重规则结束 =======

      return { customer, score };
    })
    // 只保留有分数的
    .filter((item) => item.score > 0)
    // 按分数从高到低 + 最近日期优先
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.customer.transactionDate.getTime() - a.customer.transactionDate.getTime();
    });

  if (limitCount) {
    scoredCustomers = scoredCustomers.slice(0, limitCount);
  }

  return scoredCustomers.map((item) => item.customer);
};

export const getCustomers = async (searchQuery?: string): Promise<Customer[]> => {
  if (searchQuery && searchQuery.trim().length > 0) {
    return searchCustomers(searchQuery.trim());
  }
  const customers = await getAllCustomers();
  return customers.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const ref = doc(db, 'customers', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return fromFirestore(snap);
};

export const getDeletedCustomers = async (): Promise<Customer[]> => {
  const q = query(customersCollection, where('deletedAt', '!=', null));
  const querySnapshot = await getDocs(q);
  const list = querySnapshot.docs.map(fromFirestore);
  return list.sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
};

export const addCustomer = async (
  data: Omit<Customer, 'id' | 'deletedAt'>
): Promise<void> => {
  const payload: any = {
    ...data,
    transactionDate: Timestamp.fromDate(data.transactionDate),
    deletedAt: null,
  };
  await addDoc(customersCollection, cleanUndefined(payload));
};

export const updateCustomer = async (
  id: string,
  data: Partial<Omit<Customer, 'id'>>
): Promise<void> => {
  const ref = doc(db, 'customers', id);
  const payload: any = { ...data };
  if (payload.transactionDate instanceof Date) {
    payload.transactionDate = Timestamp.fromDate(payload.transactionDate);
  }
  await updateDoc(ref, cleanUndefined(payload));
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const ref = doc(db, 'customers', id);
  await updateDoc(ref, { deletedAt: serverTimestamp() });
};

export const restoreCustomer = async (id: string): Promise<void> => {
  const ref = doc(db, 'customers', id);
  await updateDoc(ref, { deletedAt: null });
};

export const permanentlyDeleteCustomer = async (id: string): Promise<void> => {
  const ref = doc(db, 'customers', id);
  await deleteDoc(ref);
};
