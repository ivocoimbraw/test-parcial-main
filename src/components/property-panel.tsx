"use client";
import { useDesignerStore } from "@/lib/store";
import { COMPONENT_TYPES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Input,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Textarea,
} from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paintbrush, Move, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/color-picker";
import ChatPanel from "./chat-panel";

export default function PropertyPanel() {
  const { selectedComponentId, getSelectedComponent, updateComponentProperty, deleteComponent, wrapComponent } =
    useDesignerStore();

  const selectedComponent = getSelectedComponent();
  console.log("selectected component: ", selectedComponent);
  if (!selectedComponent) {
    return (
      <div className="w-64 border-l bg-[#0a0f14] p-4 flex flex-col items-center justify-center text-gray-400">
        <Move className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm text-center">Select a component to edit its properties</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateComponentProperty(selectedComponentId!, property, value);
  };

  const handleStyleChange = (property: string, value: any) => {
    updateComponentProperty(selectedComponentId!, `style.${property}`, value);
  };

  const handlePositionChange = (property: string, value: any) => {
    updateComponentProperty(selectedComponentId!, `position.${property}`, value);
  };

  const handleDelete = () => {
    deleteComponent(selectedComponentId!);
  };

  const handleWrapWith = (type: string) => {
    wrapComponent(selectedComponentId!, type);
  };

  // Table-specific handlers
  const handleAddTableRow = () => {
    const currentRows = selectedComponent.properties.rows || 3;
    handlePropertyChange("rows", currentRows + 1);
  };

  const handleRemoveTableRow = () => {
    const currentRows = selectedComponent.properties.rows || 3;
    if (currentRows > 1) {
      handlePropertyChange("rows", currentRows - 1);
    }
  };

  const handleAddTableColumn = () => {
    const currentColumns = selectedComponent.properties.columns || 3;
    const currentHeaders = selectedComponent.properties.headers || [];
    const newHeaders = [...currentHeaders, `Column ${currentColumns + 1}`];
    handlePropertyChange("columns", currentColumns + 1);
    handlePropertyChange("headers", newHeaders);
  };

  const handleRemoveTableColumn = () => {
    const currentColumns = selectedComponent.properties.columns || 3;
    if (currentColumns > 1) {
      const currentHeaders = selectedComponent.properties.headers || [];
      const newHeaders = currentHeaders.slice(0, -1);
      handlePropertyChange("columns", currentColumns - 1);
      handlePropertyChange("headers", newHeaders);
    }
  };

  const handleHeaderChange = (index: number, value: string) => {
    const currentHeaders = [...(selectedComponent.properties.headers || [])];
    currentHeaders[index] = value;
    handlePropertyChange("headers", currentHeaders);
  };

  return (
    <div className="w-64 border-l bg-[#0a0f14] flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium">Properties</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Tabs defaultValue="properties">
        <TabsList className="w-full justify-start px-3 pt-2">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="style">
            <Paintbrush className="h-4 w-4 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="position">
            <Move className="h-4 w-4 mr-1" />
            Position
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="properties" className="p-3 space-y-4">
            {selectedComponent.type === COMPONENT_TYPES.FORM && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                    id="formTitle"
                    value={selectedComponent.properties.title || ""}
                    onChange={(e) => handlePropertyChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formPadding">Padding</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="formPadding"
                      value={[selectedComponent.properties.padding || 16]}
                      min={0}
                      max={32}
                      step={4}
                      onValueChange={(value) => handlePropertyChange("padding", value[0])}
                      className="flex-1"
                    />
                    <span className="text-xs w-8 text-right">{selectedComponent.properties.padding || 16}</span>
                  </div>
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.INPUT && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inputLabel">Label</Label>
                  <Input
                    id="inputLabel"
                    value={selectedComponent.properties.label || ""}
                    onChange={(e) => handlePropertyChange("label", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inputPlaceholder">Placeholder</Label>
                  <Input
                    id="inputPlaceholder"
                    value={selectedComponent.properties.placeholder || ""}
                    onChange={(e) => handlePropertyChange("placeholder", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inputType">Input Type</Label>
                  <Select
                    value={selectedComponent.properties.type || "text"}
                    onValueChange={(value) => handlePropertyChange("type", value)}
                  >
                    <SelectTrigger id="inputType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="tel">Telephone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inputRequired">Required</Label>
                  <Select
                    value={selectedComponent.properties.required ? "true" : "false"}
                    onValueChange={(value) => handlePropertyChange("required", value === "true")}
                  >
                    <SelectTrigger id="inputRequired">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="helperText">Helper Text</Label>
                  <Input
                    id="helperText"
                    value={selectedComponent.properties.helperText || ""}
                    onChange={(e) => handlePropertyChange("helperText", e.target.value)}
                  />
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.TEXT && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <Textarea
                    id="text"
                    value={selectedComponent.properties.text || ""}
                    onChange={(e) => handlePropertyChange("text", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.BUTTON && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={selectedComponent.properties.text || ""}
                    onChange={(e) => handlePropertyChange("text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonVariant">Variant</Label>
                  <Select
                    value={selectedComponent.properties.variant || "primary"}
                    onValueChange={(value) => handlePropertyChange("variant", value)}
                  >
                    <SelectTrigger id="buttonVariant">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.APP_BAR && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="appBarTitle">Title</Label>
                  <Input
                    id="appBarTitle"
                    value={selectedComponent.properties.title || ""}
                    onChange={(e) => handlePropertyChange("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showBackButton">Show Back Button</Label>
                  <Select
                    value={selectedComponent.properties.showBackButton ? "true" : "false"}
                    onValueChange={(value) => handlePropertyChange("showBackButton", value === "true")}
                  >
                    <SelectTrigger id="showBackButton">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.SLIDER && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sliderValue">Value</Label>
                  <Input
                    id="sliderValue"
                    type="number"
                    value={selectedComponent.properties.value || 50}
                    onChange={(e) => handlePropertyChange("value", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sliderMin">Minimum</Label>
                  <Input
                    id="sliderMin"
                    type="number"
                    value={selectedComponent.properties.min || 0}
                    onChange={(e) => handlePropertyChange("min", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sliderMax">Maximum</Label>
                  <Input
                    id="sliderMax"
                    type="number"
                    value={selectedComponent.properties.max || 100}
                    onChange={(e) => handlePropertyChange("max", Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {(selectedComponent.type === COMPONENT_TYPES.DROPDOWN_BUTTON ||
              selectedComponent.type === COMPONENT_TYPES.SELECT) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="selectLabel">Label</Label>
                  <Input
                    id="selectLabel"
                    value={selectedComponent.properties.label || selectedComponent.properties.text || ""}
                    onChange={(e) =>
                      handlePropertyChange(
                        selectedComponent.type === COMPONENT_TYPES.SELECT ? "label" : "text",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {(selectedComponent.properties.options || []).map((option: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(selectedComponent.properties.options || [])];
                          newOptions[index] = e.target.value;
                          handlePropertyChange("options", newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = (selectedComponent.properties.options || []).filter(
                            (_: any, i: number) => i !== index
                          );
                          handlePropertyChange("options", newOptions);
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [
                        ...(selectedComponent.properties.options || []),
                        `Option ${(selectedComponent.properties.options || []).length + 1}`,
                      ];
                      handlePropertyChange("options", newOptions);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.TABLE && (
              <>
                <div className="space-y-2">
                  <Label>Table Structure</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Rows: {selectedComponent.properties.rows || 3}</span>
                    <Button variant="outline" size="sm" onClick={handleAddTableRow}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRemoveTableRow}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Columns: {selectedComponent.properties.columns || 3}</span>
                    <Button variant="outline" size="sm" onClick={handleAddTableColumn}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRemoveTableColumn}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Column Headers</Label>
                  {(selectedComponent.properties.headers || []).map((header: string, index: number) => (
                    <Input
                      key={index}
                      value={header}
                      onChange={(e) => handleHeaderChange(index, e.target.value)}
                      placeholder={`Header ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {selectedComponent.type === COMPONENT_TYPES.CONTAINER && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="padding">Padding</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="padding"
                      value={[selectedComponent.properties.padding || 0]}
                      min={0}
                      max={32}
                      step={4}
                      onValueChange={(value) => handlePropertyChange("padding", value[0])}
                      className="flex-1"
                    />
                    <span className="text-xs w-8 text-right">{selectedComponent.properties.padding || 0}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <ColorPicker
                    id="bgColor"
                    color={selectedComponent.properties.color || "#FFFFFF"}
                    onChange={(color) => handlePropertyChange("color", color)}
                  />
                </div>
              </>
            )}

            {(selectedComponent.type === COMPONENT_TYPES.ROW || selectedComponent.type === COMPONENT_TYPES.COLUMN) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mainAxisAlignment">Main Axis Alignment</Label>
                  <Select
                    value={selectedComponent.properties.mainAxisAlignment || "start"}
                    onValueChange={(value) => handlePropertyChange("mainAxisAlignment", value)}
                  >
                    <SelectTrigger id="mainAxisAlignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Start</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="end">End</SelectItem>
                      <SelectItem value="spaceBetween">Space Between</SelectItem>
                      <SelectItem value="spaceAround">Space Around</SelectItem>
                      <SelectItem value="spaceEvenly">Space Evenly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crossAxisAlignment">Cross Axis Alignment</Label>
                  <Select
                    value={selectedComponent.properties.crossAxisAlignment || "center"}
                    onValueChange={(value) => handlePropertyChange("crossAxisAlignment", value)}
                  >
                    <SelectTrigger id="crossAxisAlignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Start</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="end">End</SelectItem>
                      <SelectItem value="stretch">Stretch</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="style" className="p-3 space-y-4 h-full">
            <div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <ColorPicker
                  id="backgroundColor"
                  color={selectedComponent.style?.backgroundColor || "#FFFFFF"}
                  onChange={(color) => handleStyleChange("backgroundColor", color)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <ColorPicker
                  id="textColor"
                  color={selectedComponent.style?.color || "#000000"}
                  onChange={(color) => handleStyleChange("color", color)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="fontSize"
                    value={[selectedComponent.style?.fontSize || 16]}
                    min={8}
                    max={48}
                    step={1}
                    onValueChange={(value) => handleStyleChange("fontSize", value[0])}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{selectedComponent.style?.fontSize || 16}px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="borderRadius"
                    value={[selectedComponent.style?.borderRadius || 0]}
                    min={0}
                    max={32}
                    step={1}
                    onValueChange={(value) => handleStyleChange("borderRadius", value[0])}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{selectedComponent.style?.borderRadius || 0}px</span>
                </div>
              </div>

              <div className="max-h-96">
                <ChatPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="p-3 space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="positionX" className="text-xs">
                    X
                  </Label>
                  <Input
                    id="positionX"
                    type="number"
                    value={selectedComponent.position?.x || 0}
                    onChange={(e) => handlePositionChange("x", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="positionY" className="text-xs">
                    Y
                  </Label>
                  <Input
                    id="positionY"
                    type="number"
                    value={selectedComponent.position?.y || 0}
                    onChange={(e) => handlePositionChange("y", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-xs">
                    Width
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    value={selectedComponent.style?.width || ""}
                    onChange={(e) => handleStyleChange("width", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-xs">
                    Height
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={selectedComponent.style?.height || ""}
                    onChange={(e) => handleStyleChange("height", e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wrap with</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleWrapWith(COMPONENT_TYPES.CONTAINER)}>
                  Container
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleWrapWith(COMPONENT_TYPES.ROW)}>
                  Row
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleWrapWith(COMPONENT_TYPES.COLUMN)}>
                  Column
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleWrapWith(COMPONENT_TYPES.STACK)}>
                  Stack
                </Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
