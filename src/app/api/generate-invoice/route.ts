import { NextResponse } from "next/server";
import { ai } from "@/ai/genkit";
import { getCustomerById } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: "missing id" }, { status: 400 });
    }
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prompt = `请根据以下客户信息生成一段简洁的发票摘要（中文）：\n客户：${customer.customerName}\n电话：${customer.phoneNumber || "-"}\n型号：${customer.phoneModel} ${customer.phoneStorage || ""}\nIMEI：${customer.phoneImei || "-"}\n项目：${customer.repairItem}\n价格：$${customer.phonePrice}\n日期：${customer.transactionDate.toISOString().split("T")[0]}`;

    const result = await ai.generate({ prompt });
    const text = result.text();
    return NextResponse.json({ summary: text });
  } catch (e) {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
