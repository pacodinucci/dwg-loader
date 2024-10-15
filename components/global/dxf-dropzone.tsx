import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DXFDropzoneProps {
  onFileAccepted: (file: File) => void;
}

const DXFDropzone: React.FC<DXFDropzoneProps> = ({ onFileAccepted }) => {
  const [fileName, setFileName] = useState<string | null>(null); // Estado para guardar el nombre del archivo

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.name.endsWith(".dxf")) {
        setFileName(file.name); // Guardar el nombre del archivo
        onFileAccepted(file);
      } else {
        alert("Por favor, subí un archivo .dxf");
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed border-gray-300 p-5 cursor-pointer w-[92vw] mb-4 mx-auto ${
        fileName ? "border-double border-gray-500" : ""
      }`}
    >
      <input {...getInputProps()} />
      {/* Mostrar el nombre del archivo o la leyenda */}
      {fileName ? (
        <p className="text-center text-gray-500 font-bold">{fileName}</p>
      ) : (
        <p className="text-center text-gray-500">
          Arrastra un archivo .dxf acá
        </p>
      )}
    </div>
  );
};

export default DXFDropzone;
