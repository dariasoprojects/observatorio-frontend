import arcpy
import os
import zipfile
import tempfile
import json

def main():
    # Parámetro 0: archivo ZIP
    zip_path = arcpy.GetParameterAsText(0)
    
    # Parámetro 1: salida en JSON
    output_json = ""

    arcpy.AddMessage(f"Archivo ZIP recibido: {zip_path}")
    
    # Crear directorio temporal
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Descomprimir ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)

        # Buscar shapefile dentro del ZIP
        shp_files = [f for f in os.listdir(temp_dir) if f.endswith(".shp")]
        if not shp_files:
            arcpy.AddError("No se encontró ningún archivo .shp en el ZIP.")
            return

        shp_path = os.path.join(temp_dir, shp_files[0])
        arcpy.AddMessage(f"Shapefile encontrado: {shp_path}")

        # Crear Feature Layer temporal
        layer_name = "temp_layer"
        arcpy.MakeFeatureLayer_management(shp_path, layer_name)

        # Obtener extent
        desc = arcpy.Describe(layer_name)
        geom_type = desc.shapeType  
        extent = desc.extent
        strextent = f"{extent.XMin} {extent.YMin} {extent.XMax} {extent.YMax}"
        
        # Obtener total de elementos
        count_result = arcpy.GetCount_management(layer_name)
        total_elementos = int(count_result[0])
        
        
        #primera_geom = None
        #with arcpy.da.SearchCursor(layer_name, ['SHAPE@']) as cursor:
        #    for row in cursor:
        #        geom = row[0]
        #        if geom and any(part for part in geom):  # ← esto valida que hay vértices
        #            primera_geom = geom
        #            break
        #            
        #geom_json = json.loads(primera_geom.JSON)  # Convierte a dict compatible
        
        # Lista para almacenar todas las geometrías válidas
        todas_las_geometrias = []

        with arcpy.da.SearchCursor(layer_name, ['SHAPE@']) as cursor:
            for row in cursor:
                geom = row[0]
                if geom and any(part for part in geom):  # Asegura que haya vértices
                    geom_json = json.loads(geom.JSON)
                    todas_las_geometrias.append(geom_json)

        # Ahora `todas_las_geometrias` es una lista de geometrías en formato JSON

        
        

        # Crear JSON
        result_dict = {"ultimo": strextent, "geom_type": geom_type, "total_elementos": total_elementos , "geometria": todas_las_geometrias}
        #result_dict = {"ultimo": strextent}
        result_json = json.dumps(result_dict, indent=2)
        arcpy.AddMessage("Resultado JSON generado.")
        
        
        arcpy.AddMessage(f"Resultado JSON a retornar: {result_json}")
        if result_json:
            arcpy.SetParameterAsText(1, result_json)
        else:
            arcpy.AddError("El JSON de salida está vacío o no válido.")
        
        # Devolver resultado
        #arcpy.SetParameterAsText(1, result_json)

    except Exception as e:
        arcpy.AddError(f"Ocurrió un error: {e}")

if __name__ == "__main__":
    main()
