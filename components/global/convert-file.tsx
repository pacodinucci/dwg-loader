"use client";

import React, { useState } from "react";
import axios from "axios";

const ConvertFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const token = "5534924a434e897f9d39f7fd3196c4cd";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo primero");
      return;
    }

    setLoading(true);

    try {
      // Crear un formData para enviar el archivo
      const formData = new FormData();
      formData.append("file", file); // Archivo a convertir
      formData.append("to", outputFormat); // Formato de salida (pdf, jpg, etc.)
      formData.append("token", token); // Token de autenticación de la API

      // Hacer la petición POST a la API de conversión
      const response = await axios.post(
        "https://api-tasker.onlineconvertfree.com/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Asegurar que se está enviando un formData
          },
        }
      );

      console.log(response);

      // Asumiendo que la API devuelve una URL del archivo convertido
      setDownloadUrl(response.data.CONVERTED_FILE); // Ajusta esto si el formato de la respuesta es diferente
    } catch (error) {
      console.error("Error durante la conversión:", error);
      alert("Error durante la conversión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Convertidor de Archivos</h1>
      <input type="file" onChange={handleFileChange} />
      <select
        value={outputFormat}
        onChange={(e) => setOutputFormat(e.target.value)}
      >
        <option value="pdf">PDF</option>
        <option value="jpg">JPG</option>
        <option value="dxf">DXF</option>
      </select>
      <button onClick={handleConvert} disabled={loading}>
        {loading ? "Convirtiendo..." : "Convertir"}
      </button>

      {downloadUrl && (
        <div>
          <p>Archivo convertido exitosamente:</p>
          <a href={downloadUrl} download>
            Descargar archivo convertido
          </a>
        </div>
      )}
    </div>
  );
};

export default ConvertFile;
