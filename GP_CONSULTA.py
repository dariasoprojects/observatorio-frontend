import arcpy
import tempfile
import os
import zipfile
import json

def main():
    # Obtener parámetros del script
    Area_of_Interest = arcpy.GetParameterAsText(0)  # FeatureSet o FeatureLayer válido

    # Mensajes de depuración
    arcpy.AddMessage("Area_of_Interest: {}".format(Area_of_Interest))
    
    # Verificar si el Area_of_Interest es válido
    if not arcpy.Exists(Area_of_Interest):
        arcpy.AddError("El Area_of_Interest no existe o no es válido: {}".format(Area_of_Interest))
        return

    try:
        # Describir el Area_of_Interest
        desc = arcpy.Describe(Area_of_Interest)                                        
        extent = desc.extent        
        xmin    =   extent.XMin
        ymin    =   extent.YMin 
        xmax    =   extent.XMax 
        ymax    =   extent.YMax        
        strextent = str(xmin) + " "  + str(ymin) + " "  + str(xmax)  + " "  + str(ymax)                
        
        result_dict = {                
            "ultimo" : strextent
        }
        
        result_json = json.dumps(result_dict, indent=2)

        arcpy.SetParameterAsText(1, result_json)                
           
    except arcpy.ExecuteError:
        arcpy.AddError("Error de Arcpy: {}".format(arcpy.GetMessages(2)))
    except Exception as e:
        arcpy.AddError("Ocurrió un error inesperado: {}".format(e))

if __name__ == "__main__":
    main()