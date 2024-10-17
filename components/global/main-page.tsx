"use client";

import { useState } from "react";
import DXFDropzone from "./dxf-dropzone";
import DxfParser, { IEntity } from "dxf-parser";
import { Separator } from "../ui/separator";
import { ChevronRight, Download } from "lucide-react"; // Solo usaremos un icono, pero lo rotaremos
import * as XLSX from "xlsx"; // Importar xlsx para exportar a Excel
import { Button } from "../ui/button";

interface LayerEntities {
  [key: string]: IEntity[];
}

interface GroupedEntities {
  name: string;
  count: number;
  layers: { layer: string; count: number }[];
}

interface NamedEntity extends IEntity {
  name?: string; // Hacer que 'name' sea opcional
}

export default function Home() {
  const [layerEntities, setLayerEntities] = useState<LayerEntities>({});
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null); // Estado para controlar la expansión de filas

  const handleFileAccepted = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string | undefined;
        if (result) {
          const parser = new DxfParser();
          const dxf = parser.parseSync(result);

          console.log("Contenido completo del archivo DXF:", dxf);

          if (dxf) {
            // Agrupar las entidades por capa
            const entitiesByLayer: LayerEntities = {};
            dxf.entities.forEach((entity) => {
              const layerName = entity.layer || "undefined";
              if (!entitiesByLayer[layerName]) {
                entitiesByLayer[layerName] = [];
              }
              entitiesByLayer[layerName].push(entity);
            });

            setLayerEntities(entitiesByLayer);
          } else {
            console.error(
              "El archivo DXF no pudo ser analizado correctamente."
            );
          }
        } else {
          console.error("No se pudo leer el archivo");
        }
      } catch (error) {
        console.error("Error al leer el archivo DXF:", error);
      }
    };
    reader.readAsText(file);
  };

  // Agrupar entidades por nombre y contar cuántas hay en cada capa
  const groupedEntities: GroupedEntities[] = [];
  const entityMap: { [key: string]: GroupedEntities } = {};

  Object.keys(layerEntities).forEach((layer) => {
    layerEntities[layer].forEach((entity) => {
      const namedEntity = entity as NamedEntity;
      const entityName = namedEntity.name;
      if (entityName) {
        if (!entityMap[entityName]) {
          entityMap[entityName] = { name: entityName, count: 0, layers: [] };
        }

        // Contar las entidades por capa
        const layerEntry = entityMap[entityName].layers.find(
          (l) => l.layer === layer
        );
        if (layerEntry) {
          layerEntry.count += 1;
        } else {
          entityMap[entityName].layers.push({ layer, count: 1 });
        }

        entityMap[entityName].count += 1;
      }
    });
  });

  // Convertimos el map a un array
  for (const entityName in entityMap) {
    groupedEntities.push(entityMap[entityName]);
  }

  const toggleEntity = (entityName: string) => {
    setExpandedEntity((prev) => (prev === entityName ? null : entityName));
  };

  // Función para exportar los datos de la tabla a un archivo Excel
  const exportToExcel = () => {
    const worksheetData: any[][] = [
      ["Nombre", "Layer", "Cantidad"], // Encabezados de la tabla
    ];

    groupedEntities.forEach((groupedEntity) => {
      groupedEntity.layers.forEach((layerDetail) => {
        worksheetData.push([
          groupedEntity.name,
          layerDetail.layer,
          layerDetail.count,
        ]);
      });
    });

    // Crear la hoja de trabajo (worksheet)
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Crear el libro de trabajo (workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    // Exportar el archivo
    XLSX.writeFile(workbook, "datos_dxf.xlsx");
  };

  return (
    <div className="px-4 py-8 w-full min-h-screen">
      <DXFDropzone onFileAccepted={handleFileAccepted} />
      <Separator />

      {groupedEntities.length > 0 && (
        <>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-green-800 hover:bg-green-700 text-white py-4 px-4 rounded font-semibold flex items-center gap-2"
              onClick={exportToExcel}
            >
              {/* Download */}
              <Download />
            </Button>
          </div>
          <div className="my-4 rounded-md w-full overflow-x-auto">
            <table className="border-collapse border border-gray-300 max-w-full w-full table-fixed text-neutral-800">
              <thead>
                <tr className="bg-green-50">
                  <th className="border px-4 py-2 w-1/2 break-words">Nombre</th>
                  <th className="border px-4 py-2 w-[35%] break-words">
                    Layer
                  </th>
                  <th className="border px-4 py-2 w-[15%] break-words">
                    {/* Texto para pantallas pequeñas */}
                    <span className="block lg:hidden">#</span>
                    {/* Texto para pantallas grandes */}
                    <span className="hidden lg:block">Cantidad</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedEntities.map((groupedEntity) => (
                  <>
                    <tr
                      key={groupedEntity.name}
                      onClick={() => toggleEntity(groupedEntity.name)}
                      className="cursor-pointer bg-white hover:bg-emerald-50"
                    >
                      <td className="border p-2 flex items-center gap-2">
                        <ChevronRight
                          className={`mx-2 shrink-0 transition-transform duration-200 text-green-900 ${
                            expandedEntity === groupedEntity.name
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                        {groupedEntity.name}
                      </td>
                      <td className="border px-4 py-2 text-center"></td>
                      <td className="border px-4 py-2 text-center">
                        {groupedEntity.count}
                      </td>
                    </tr>

                    {expandedEntity === groupedEntity.name &&
                      groupedEntity.layers.map((layerDetail) =>
                        Array(layerDetail.count)
                          .fill(0)
                          .map((_, i) => (
                            <tr
                              key={`${groupedEntity.name}-${layerDetail.layer}-${i}`}
                              className="bg-emerald-50"
                            >
                              <td className="border px-4 py-2 pl-8 text-center">
                                {groupedEntity.name}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {layerDetail.layer}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                1
                              </td>
                            </tr>
                          ))
                      )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
