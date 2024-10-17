import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

interface DXFDropzoneProps {
  onFileAccepted: (file: File, isDWG: boolean) => void;
}

const DXFDropzone: React.FC<DXFDropzoneProps> = ({ onFileAccepted }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Función para manejar la conversión de DWG a DXF
  const handleDWGConversion = async (file: File) => {
    try {
      setLoading(true); // Mostrar indicador de carga mientras se realiza la conversión

      // Crear formData para enviar el archivo a tu API de Next.js
      const formData = new FormData();
      formData.append("file", file);
      formData.append("to", "dxf"); // Queremos convertir a DXF
      const token = "5534924a434e897f9d39f7fd3196c4cd"; // Reemplaza con tu token real
      formData.append("token", token); // Token de autenticación

      // Hacer la petición a la API de conversión en tu servidor
      const response = await axios.post("/api/convert", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // Aseguramos que obtenemos el archivo convertido
      });

      // Crear un nuevo archivo DXF a partir de la respuesta
      const convertedDXFFile = new File(
        [response.data],
        file.name.replace(".dwg", ".dxf"),
        {
          type: "application/dxf",
        }
      );

      // Procesar el archivo convertido como si fuera un archivo DXF
      setFileName(convertedDXFFile.name);
      onFileAccepted(convertedDXFFile, true); // Pasar el archivo convertido
    } catch (error) {
      console.error("Error en la conversión:", error);
      alert("Hubo un problema al convertir el archivo .dwg a .dxf.");
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "dxf") {
          // Procesar como un archivo DXF normal
          setFileName(file.name);
          onFileAccepted(file, false); // Procesar como DXF
        } else if (fileExtension === "dwg") {
          // Convertir archivo DWG a DXF
          setFileName(file.name);
          handleDWGConversion(file); // Llamar a la función de conversión
        } else {
          alert("Por favor, subí un archivo .dxf o .dwg");
        }
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/dxf": [".dxf"],
      "application/dwg": [".dwg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-green-700 p-5 cursor-pointer mb-4 mx-auto rounded-md ${
        fileName ? "border-double border-green-900" : ""
      }`}
    >
      <input {...getInputProps()} />
      {loading ? (
        <p className="text-center text-green-900">
          Convirtiendo archivo .dwg...
        </p>
      ) : fileName ? (
        <p className="text-center text-green-900 font-bold">{fileName}</p>
      ) : (
        <p className="text-center text-gray-500">
          Arrastra un archivo .dxf o .dwg acá
        </p>
      )}
    </div>
  );
};

export default DXFDropzone;
