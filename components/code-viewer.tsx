"use client";

import JSZip from "jszip";
import { useState, useEffect } from "react";
import { useDesignerStore } from "@/lib/store";
import { exportFlutterCodeTest } from "@/lib/code-generator";
import { parseFlutterCode } from "@/lib/code-parser";
import { Button } from "@/components/ui/button";
import { Clipboard, Download, Upload, RefreshCw, Code2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CodeViewer() {
  const { componentTree, setComponentTree, currentPageId, pages } = useDesignerStore();
  const [code, setCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const { toast } = useToast();

  useEffect(() => {
    // Generate Flutter code from the component tree
    const generatedCode = exportFlutterCodeTest(pages);
    setCode(generatedCode);
  }, [componentTree]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to Clipboard",
      description: "Flutter code has been copied to clipboard.",
    });
  };

  const handleExportCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flutter_ui_${new Date().toISOString().slice(0, 10)}.dart`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code Exported",
      description: "Flutter code has been exported successfully.",
    });
  };

  const handleExportCodeAndZip = async () => {
    const zip = new JSZip();

    // 1. Obtener el archivo desde public
    const response = await fetch('/flutter_creator.bat'); // ruta del archivo en public
    if (!response.ok) {
      console.error('No se pudo descargar el archivo público');
      return;
    }
    const publicFileBlob = await response.blob();

    // Añadir archivo público al zip
    zip.file("flutter_creator.bat", publicFileBlob);

    // 2. Crear el nuevo archivo (como tu código Dart)
    const codeBlob = new Blob([code], { type: "text/plain" });
    zip.file(`main.dart`, codeBlob);

    // 3. Generar el zip y crear URL para descargar
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);

    // 4. Crear enlace y descargar
    const a = document.createElement("a");
    a.href = url;
    a.download = `flutter_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Files have been zipped and exported successfully.",
    });
  };


  const handleImportCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Import Failed",
        description: "Please paste Flutter code to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const parsedComponents = await parseFlutterCode(inputCode);
      if (parsedComponents) {
        setComponentTree(parsedComponents);
        setInputCode("");
        setActiveTab("view");
        toast({
          title: "Code Imported Successfully",
          description: "Flutter code has been imported and converted to visual components.",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Could not parse the Flutter code. Please check the format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to parse Flutter code. Please check the syntax.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLoadFromFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".dart,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setInputCode(content);
          setActiveTab("import");
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const refreshCode = () => {
    const generatedCode = exportFlutterCodeTest(pages);
    setCode(generatedCode);
    toast({
      title: "Code Refreshed",
      description: "Code has been regenerated from current design.",
    });
  };

  const getCodeStats = () => {
    const lines = code.split("\n").length;
    const characters = code.length;
    const widgets = (code.match(/\w+\(/g) || []).length;
    return { lines, characters, widgets };
  };

  const stats = getCodeStats();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="view" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                View Code
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Code
              </TabsTrigger>
            </TabsList>

            {activeTab === "view" && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{stats.lines} lines</span>
                <span>•</span>
                <span>{stats.widgets} widgets</span>
                <span>•</span>
                <span>{(stats.characters / 1024).toFixed(1)}KB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "view" && (
              <>
                <Button variant="outline" size="sm" onClick={refreshCode}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCodeAndZip}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}

            {activeTab === "import" && (
              <>
                <Button variant="outline" size="sm" onClick={handleLoadFromFile}>
                  <FileText className="h-4 w-4 mr-1" />
                  Load File
                </Button>
                <Button onClick={handleImportCode} disabled={!inputCode.trim() || isImporting} size="sm">
                  {isImporting ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  {isImporting ? "Importing..." : "Import"}
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="view" className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-900 text-gray-100 p-4 rounded-lg border shadow-sm">
                <div className="overflow-y-visible">
                  <code className="language-dart">{code}</code>
                </div>
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="import" className="flex-1 p-0 flex flex-col">
          <div className="flex-1 p-4 flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Import Flutter Code</h4>
              <p className="text-sm text-blue-700 mb-2">Paste your Flutter widget code below. The parser supports:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Standard Flutter widgets (Container, Row, Column, Text, etc.)</li>
                <li>• Nested widget structures</li>
                <li>• Basic properties and styling</li>
                <li>• Form components and input fields</li>
              </ul>
            </div>

            <Textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Paste your Flutter code here, for example:

Container(
  padding: EdgeInsets.all(16),
  child: Column(
    children: [
      Text('Hello World'),
      ElevatedButton(
        onPressed: () {},
        child: Text('Click Me'),
      ),
    ],
  ),
)`}
              className="flex-1 font-mono text-sm min-h-[400px] resize-none"
            />

            {inputCode.trim() && (
              <div className="text-xs text-gray-500">
                {inputCode.split("\n").length} lines • {(inputCode.length / 1024).toFixed(1)}KB
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
