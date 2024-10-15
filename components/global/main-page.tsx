"use client";

import { useState } from "react";
import DXFDropzone from "./dxf-dropzone";
import DxfParser, { IEntity } from "dxf-parser";
import { Separator } from "../ui/separator";
import { ChevronRight, ChevronDown } from "lucide-react";

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

  return (
    <div className="px-4 py-8">
      <DXFDropzone onFileAccepted={handleFileAccepted} />
      <Separator />

      {groupedEntities.length > 0 && (
        <div className="my-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 w-48">Nombre</th>
                <th className="border px-4 py-2 w-48">Layer</th>
                <th className="border px-4 py-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {groupedEntities.map((groupedEntity) => (
                <>
                  <tr
                    key={groupedEntity.name}
                    onClick={() => toggleEntity(groupedEntity.name)}
                    className="cursor-pointer bg-white hover:bg-gray-50"
                  >
                    <td className="border px-4 py-2 flex items-center justify-between">
                      {groupedEntity.name}
                      {expandedEntity === groupedEntity.name ? (
                        <ChevronDown className="mx-2 shrink-0" />
                      ) : (
                        <ChevronRight className="mx-2 shrink-0" />
                      )}
                    </td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">{groupedEntity.count}</td>
                  </tr>

                  {expandedEntity === groupedEntity.name &&
                    groupedEntity.layers.map((layerDetail) =>
                      Array(layerDetail.count)
                        .fill(0)
                        .map((_, i) => (
                          <tr
                            key={`${groupedEntity.name}-${layerDetail.layer}-${i}`}
                            className="bg-gray-50"
                          >
                            <td className="border px-4 py-2 pl-8">
                              {groupedEntity.name}
                            </td>
                            <td className="border px-4 py-2">
                              {layerDetail.layer}
                            </td>
                            <td className="border px-4 py-2">1</td>
                          </tr>
                        ))
                    )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
