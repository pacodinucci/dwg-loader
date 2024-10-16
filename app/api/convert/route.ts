import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { Buffer } from "buffer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fileBlob = formData.get("file") as Blob;
    const to = formData.get("to") as string;
    const token = formData.get("token") as string;

    if (!fileBlob || !to || !token) {
      return NextResponse.json(
        { message: "Faltan campos requeridos (file, to, token)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const conversionFormData = new FormData();
    conversionFormData.append("file", buffer, "input.dwg");
    conversionFormData.append("to", to);
    conversionFormData.append("token", token);

    const response = await axios.post(
      "https://api-tasker.onlineconvertfree.com/api/upload",
      conversionFormData,
      {
        headers: {
          ...conversionFormData.getHeaders(),
        },
      }
    );

    const convertedDXFUrl = response.data.CONVERTED_FILE;

    const fileResponse = await axios.get(convertedDXFUrl, {
      responseType: "arraybuffer",
    });

    return new NextResponse(fileResponse.data, {
      headers: {
        "Content-Type": "application/dxf",
        "Content-Disposition": `attachment; filename="converted.dxf"`,
      },
    });
  } catch (error) {
    console.error("Error en la conversión:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error durante la conversión del archivo" }),
      { status: 500 }
    );
  }
}
