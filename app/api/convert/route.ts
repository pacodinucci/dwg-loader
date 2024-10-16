import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { Buffer } from "buffer";

// Configuración para desactivar el bodyParser y permitir el manejo de archivos
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función POST que maneja la conversión de archivos
export async function POST(req: NextRequest) {
  try {
    // Obtener el formData del request
    const formData = await req.formData();

    const fileBlob = formData.get("file") as Blob; // Obtenemos el archivo como Blob
    const to = formData.get("to") as string; // Formato de salida (dxf en este caso)
    const token = formData.get("token") as string; // Token de autenticación

    if (!fileBlob || !to || !token) {
      return NextResponse.json(
        { message: "Faltan campos requeridos (file, to, token)" },
        { status: 400 }
      );
    }

    // Convertir el Blob en un Buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Crear un nuevo FormData para enviar a la API de conversión
    const conversionFormData = new FormData();
    conversionFormData.append("file", buffer, "input.dwg"); // Usamos el Buffer como archivo
    conversionFormData.append("to", to); // Formato de salida (dxf)
    conversionFormData.append("token", token); // Token de autenticación

    // Enviar el archivo a la API de conversión
    const response = await axios.post(
      "https://api-tasker.onlineconvertfree.com/api/upload",
      conversionFormData,
      {
        headers: {
          ...conversionFormData.getHeaders(),
        },
      }
    );

    // Obtener la URL del archivo convertido
    const convertedDXFUrl = response.data.CONVERTED_FILE;

    // Descargar el archivo convertido y devolverlo al cliente
    const fileResponse = await axios.get(convertedDXFUrl, {
      responseType: "arraybuffer",
    });

    // Enviar el archivo convertido al cliente
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
