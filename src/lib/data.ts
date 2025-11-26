
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

// Helper to convert Firestore doc to Customer object
const fromFirestore = (doc: any): Customer => {
    const data = doc.data();
    // Backward compatibility for repairItems which might be an array
    const repairItem = Array.isArray(data.repairItem) ? data.repairItem[0] || '' : data.repairItem || '';

    return {
        id: doc.id,
        ...data,
        transactionDate: (data.transactionDate as Timestamp).toDate(),
        deletedAt: data.deletedAt ? (data.deletedAt as Timestamp).toDate() : null,
        repairItem,
        notes: data.notes || '',
    };
}

const getAllCustomers = async (): Promise<Customer[]> => {
    const q = query(customersCollection, where('deletedAt', '==', null));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
}

export const searchCustomers = async (searchQuery: string, limitCount?: number): Promise<Customer[]> => {
  const allCustomers = await getAllCustomers();

  if (!searchQuery) {
    const sorted = allCustomers.sort((a,b) => b.transactionDate.getTime() - a.transactionDate.getTime());
    return limitCount ? sorted.slice(0, limitCount) : sorted;
  }

  const lowerCaseQuery = searchQuery.toLowerCase();

  let scoredCustomers = allCustomers
    .map(customer => {
      let score = 0;
      const lowerCaseName = customer.customerName.toLowerCase();
      const lowerCaseModel = customer.phoneModel.toLowerCase();
      const lowerCaseImei = customer.phoneImei.toLowerCase();
      const lowerCasePrice = customer.phonePrice.toLowerCase();
      const repairItemPath = getFullLabelPathForRepairItem(customer.repairItem).toLowerCase();
      const notes = (customer.notes || '').toLowerCase();
      
      const transactionDate = customer.transactionDate;
      const dateString = transactionDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

      // IMEI exact match
      if (lowerCaseImei === lowerCaseQuery) score += 100;
      // Name exact match
      if (lowerCaseName === lowerCaseQuery) score += 80;
      // Price exact match
      if (lowerCasePrice === lowerCaseQuery) score += 50;
      // Model exact match
      if (lowerCaseModel === lowerCaseQuery) score += 40;

      // Partial matches
      if (lowerCaseImei.includes(lowerCaseQuery)) score += 30;
      if (lowerCaseName.includes(lowerCaseQuery)) score += 20;
      if (lowerCaseModel.includes(lowerCaseQuery)) score += 15;
      if (repairItemPath.includes(lowerCaseQuery)) score += 10;
      if (notes.includes(lowerCaseQuery)) score += 10;
      if (lowerCasePrice.includes(lowerCaseQuery)) score += 5;

      // Date matching
      try {
        const queryDate = new Date(lowerCaseQuery);
         if (!isNaN(queryDate.getTime())) {
            // If user searches for a date like "2023-10-26"
            if (dateString === lowerCaseQuery) {
                score += 60;
            }
             // more fuzzy date matching
            else if (transactionDate.getFullYear() === queryDate.getFullYear() &&
                transactionDate.getMonth() === queryDate.getMonth() &&
                transactionDate.getDate() === queryDate.getDate())
            {
                score += 50;
            } else if (lowerCaseQuery.includes(String(transactionDate.getFullYear())) && (lowerCaseQuery.includes(String(transactionDate.getMonth()+1)) || lowerCaseQuery.includes(transactionDate.toLocaleString('en-US', { month: 'short' }).toLowerCase()) ) ) {
                score += 20;
            }
        }
      } catch (e) { /* ignore, query is not a date */ }
       if (dateString.includes(lowerCaseQuery)) score += 10;


      return { customer, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    if (limitCount) {
        scoredCustomers = scoredCustomers.slice(0, limitCount);
    }

    return scoredCustomers.map(item => item.customer);
}

export const getCustomers = async (searchQuery?: string): Promise<Customer[]> => {
  return await searchCustomers(searchQuery);
};

export const getDeletedCustomers = async (): Promise<Customer[]> => {
  const q = query(customersCollection, where('deletedAt', '!=', null));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(fromFirestore);
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  const docRef = doc(db, 'customers', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return fromFirestore(docSnap);
  }
  return undefined;
};

export const addCustomer = async (data: Omit<Customer, 'id' | 'deletedAt'>): Promise<Customer> => {
  const docRef = await addDoc(customersCollection, {
      ...data,
      transactionDate: Timestamp.fromDate(data.transactionDate),
      deletedAt: null,
  });
  const newCustomer = await getCustomerById(docRef.id);
  return newCustomer!;
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id'>>): Promise<Customer | undefined> => {
    const docRef = doc(db, 'customers', id);
    
    // Firestore does not allow undefined values. We need to clean the object.
    const cleanData: {[key: string]: any} = {};
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
             if (key === 'transactionDate' && value instanceof Date) {
                cleanData[key] = Timestamp.fromDate(value);
            } else {
                cleanData[key] = value;
            }
        }
    }
    
    await updateDoc(docRef, cleanData);
    return await getCustomerById(id);
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'customers', id);
        await updateDoc(docRef, { deletedAt: serverTimestamp() });
        return true;
    } catch(e) {
        console.error("Error deleting customer: ", e);
        return false;
    }
};

export const restoreCustomer = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'customers', id);
        await updateDoc(docRef, { deletedAt: null });
        return true;
    } catch(e) {
        console.error("Error restoring customer: ", e);
        return false;
    }
};

export const permanentlyDeleteCustomer = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, 'customers', id);
        await deleteDoc(docRef);
        return true;
    } catch(e) {
        console.error("Error permanently deleting customer: ", e);
        return false;
    }
};
