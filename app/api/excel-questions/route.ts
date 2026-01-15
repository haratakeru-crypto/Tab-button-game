import { NextRequest, NextResponse } from "next/server";
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

export async function PUT(request: NextRequest) {
  try {
    // 開発環境でのみ実行可能
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "本番環境では使用できません" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { questionId, targetZone } = body;

    if (!questionId || !targetZone) {
      return NextResponse.json(
        { error: "questionIdとtargetZoneが必要です" },
        { status: 400 }
      );
    }

    // excel-questions.jsonを読み込む
    const fileContents = await fs.readFile(EXCEL_QUESTIONS_FILE_PATH, "utf8");
    const questions: Question[] = JSON.parse(fileContents);

    // 指定されたIDの問題を探して更新
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return NextResponse.json(
        { error: "問題が見つかりません" },
        { status: 404 }
      );
    }

    // targetZoneを更新
    questions[questionIndex].targetZone = targetZone;

    // excel-questions.jsonに保存
    await fs.writeFile(
      EXCEL_QUESTIONS_FILE_PATH,
      JSON.stringify(questions, null, 2),
      "utf8"
    );

    return NextResponse.json({
      success: true,
      message: "ターゲットゾーンを更新しました",
      question: questions[questionIndex],
    });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
