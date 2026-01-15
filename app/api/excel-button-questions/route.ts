import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Question, TargetZone } from "@/types/question";

const EXCEL_BUTTON_QUESTIONS_FILE_PATH = path.join(process.cwd(), "data", "excel-button-questions.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(EXCEL_BUTTON_QUESTIONS_FILE_PATH, "utf8");
    const questions: Question[] = JSON.parse(fileContents);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error reading excel button questions:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "本番環境では使用できません" }, { status: 403 });
    }

    const body = await request.json();
    const { questionId, targetZone, explanationText } = body as {
      questionId?: number;
      targetZone?: TargetZone;
      explanationText?: string;
    };

    if (!questionId) {
      return NextResponse.json({ error: "questionIdが必要です" }, { status: 400 });
    }

    const fileContents = await fs.readFile(EXCEL_BUTTON_QUESTIONS_FILE_PATH, "utf8");
    const questions: Question[] = JSON.parse(fileContents);
    const idx = questions.findIndex((q) => q.id === questionId);

    if (idx === -1) {
      return NextResponse.json({ error: "問題が見つかりません" }, { status: 404 });
    }

    if (targetZone) {
      questions[idx].targetZone = targetZone;
    }
    if (typeof explanationText === "string") {
      questions[idx].explanationText = explanationText;
    }

    await fs.writeFile(EXCEL_BUTTON_QUESTIONS_FILE_PATH, JSON.stringify(questions, null, 2), "utf8");

    return NextResponse.json({ success: true, question: questions[idx] });
  } catch (error) {
    console.error("Error updating excel button questions:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
