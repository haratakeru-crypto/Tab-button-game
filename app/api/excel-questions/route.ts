import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Question } from "@/types/question";

const EXCEL_QUESTIONS_FILE_PATH = path.join(process.cwd(), "data", "excel-questions.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(EXCEL_QUESTIONS_FILE_PATH, "utf8");
    const questions: Question[] = JSON.parse(fileContents);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error reading excel questions:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
