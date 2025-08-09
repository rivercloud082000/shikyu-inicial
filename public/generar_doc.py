from docxtpl import DocxTemplate
import json

# Cargar el archivo JSON
with open("datos.json", encoding="utf-8") as file:
    contexto = json.load(file)

# Cargar la plantilla Word
doc = DocxTemplate("plantilla-final.docx")

# Renderizar el documento con los datos del JSON
doc.render(contexto)

# Guardar el archivo generado
doc.save("documento_final.docx")

print("✅ Documento generado correctamente como documento_final.docx")
