"use client";

import { useSelectedHome } from "@/contexts/SelectedHomeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home } from "lucide-react";

export function HomeSelector() {
  const { selectedHomeId, setSelectedHomeId, availableHomes, isLoading } = useSelectedHome();

  if (isLoading || availableHomes.length === 0) {
    return null;
  }

  const selectedHome = availableHomes.find(home => home.id === selectedHomeId);

  return (
    <div className="flex items-center space-x-2">
      <Home className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedHomeId?.toString() || ""} 
        onValueChange={(value) => setSelectedHomeId(parseInt(value))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select home">
            {selectedHome?.name || "Select home"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableHomes.map((home) => (
            <SelectItem key={home.id} value={home.id.toString()}>
              {home.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
