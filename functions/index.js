// 使用 v1 API（旧版写法），明确写 /v1，避免和 v2 冲突
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

// Firestore 引用
const db = admin.firestore();

// 自动归档：把 6 个月前的 records 移动到 archived_customers
exports.autoArchiveOldInvoices = functions.pubsub
  // 每天 0 点触发，配合 timeZone = Australia/Sydney，就是悉尼时间 00:00
  .schedule("0 0 * * *") // 标准 crontab 写法：分 时 日 月 星期
  .timeZone("Australia/Sydney")
  .onRun(async (context) => {
    console.log("Starting auto-archive job...");

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const customersRef = db.collection("customers");

    // 直接用 Date 对象，Firestore SDK 会自动转换成 Timestamp
    const oldInvoices = await customersRef
      .where("transactionDate", "<", sixMonthsAgo)
      .get();

    if (oldInvoices.empty) {
      console.log("No invoices to archive.");
      return null;
    }

    const batch = db.batch();

    oldInvoices.forEach((doc) => {
      const data = doc.data();
      const archivedRef = db.collection("archived_customers").doc(doc.id);

      batch.set(archivedRef, {
        ...data,
        archivedAt: new Date().toISOString(), // 记录归档时间
      });

      batch.delete(doc.ref); // 从 customers 里删掉原记录
    });

    await batch.commit();

    console.log(`Archived ${oldInvoices.size} invoices.`);
    return null;
  });
