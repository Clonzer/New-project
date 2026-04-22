import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Package, Printer as PrinterIcon, Edit, Trash2
} from "lucide-react";
import { categoryLabel } from "@/lib/equipment-catalog";

export function Equipment({
  myEquipmentGroups,
  myPrinters,
  setShowAddEquipmentGroup,
  setEditingEquipmentGroup,
  handleDeleteEquipmentGroup,
  setShowAddPrinter,
  setEditingPrinter,
  handleAssignToGroup,
  togglingPrinterId,
  togglePrinter,
  deletingPrinterId,
  removePrinter,
  handleUpdateEquipmentStatus
}) {
  return (
    <div className="space-y-8">
      {/* Equipment Groups Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Equipment Groups</h2>
            <NeonButton glowColor="accent" className="rounded-full px-5" onClick={() => setShowAddEquipmentGroup(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Group
            </NeonButton>
          </div>
          {!myEquipmentGroups?.length ? (
            <div className="glass-panel p-8 rounded-2xl text-center mb-6">
              <Package className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 mb-3">No equipment groups yet.</p>
              <p className="text-zinc-600 text-sm mb-4">Groups help organize your equipment for better product transparency.</p>
              <NeonButton glowColor="accent" onClick={() => setShowAddEquipmentGroup(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create First Group
              </NeonButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {myEquipmentGroups.map(group => (
                <div key={group.id} className="glass-panel p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white text-sm">{group.name}</h3>
                      <p className="text-xs text-zinc-400 capitalize">{group.category.replace('_', ' ')}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-zinc-500 hover:text-white"
                        onClick={() => setEditingEquipmentGroup(group)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-zinc-500 hover:text-red-400"
                        onClick={() => handleDeleteEquipmentGroup(group.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2">{group.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equipment Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Registered Equipment</h2>
            <NeonButton glowColor="accent" className="rounded-full px-5" onClick={() => setShowAddPrinter(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add equipment
            </NeonButton>
          </div>
          {!myPrinters?.length ? (
            <div className="glass-panel p-16 rounded-3xl text-center">
              <PrinterIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">No equipment listed yet.</p>
              <NeonButton glowColor="accent" onClick={() => setShowAddPrinter(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add your first equipment
              </NeonButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPrinters.map(printer => (
                <div key={printer.id} className="glass-panel p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <PrinterIcon className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{printer.name}</h3>
                        <p className="text-sm text-zinc-400">{printer.brand} {printer.model}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={printer.is_active ? "default" : "secondary"} className={printer.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}>
                        {printer.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <select
                        className="text-xs bg-black/30 border border-white/10 text-zinc-300 rounded px-2 py-1"
                        value={printer.equipment_status || "operational"}
                        onChange={(e) => handleUpdateEquipmentStatus && handleUpdateEquipmentStatus(printer.id, e.target.value)}
                      >
                        <option value="operational">Operational</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="out-of-service">Out of Service</option>
                        <option value="busy">Busy</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300 mb-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Category</span>
                      <span className="text-zinc-200 font-medium">{categoryLabel(printer.equipment_category ?? "printing_3d")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Group</span>
                      <Select
                        value={printer.equipment_group_id || "none"}
                        onValueChange={(value) => handleAssignToGroup && handleAssignToGroup(printer.id, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-32 bg-black/30 border-white/10 text-white h-7 text-xs">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-white/10 text-white">
                          <SelectItem value="none">None</SelectItem>
                          {myEquipmentGroups?.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {printer.equipment_category === "printing_3d" || !printer.equipment_category ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Process</span>
                        <span className="text-accent font-medium">{printer.technology}</span>
                      </div>
                    ) : printer.tool_or_service_type ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Type</span>
                        <span className="text-accent font-medium">{printer.tool_or_service_type}</span>
                      </div>
                    ) : null}
                    {printer.equipment_category === "printing_3d" || !printer.equipment_category ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Build Volume</span>
                        <span className="text-zinc-200 font-medium">{printer.build_volume || "N/A"}</span>
                      </div>
                    ) : null}
                    {printer.equipment_category === "printing_3d" || !printer.equipment_category ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Materials</span>
                        <span className="text-zinc-200 font-medium">{Array.isArray(printer.materials) ? printer.materials.join(", ") : printer.materials || "N/A"}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hourly Rate</span>
                      <span className="text-zinc-200 font-medium">{printer.price_per_hour ? `$${printer.price_per_hour}/hr` : "Not set"}</span>
                    </div>
                    {printer.equipment_category === "printing_3d" || !printer.equipment_category ? (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Per-Gram Rate</span>
                        <span className="text-zinc-200 font-medium">{printer.price_per_gram ? `$${printer.price_per_gram}/g` : "Not set"}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Jobs Completed</span>
                      <span className="text-white font-bold">{printer.total_jobs_completed || 0}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-end gap-2 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-500 hover:text-white"
                      onClick={() => setEditingPrinter(printer)}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${printer.is_active ? "text-red-400 hover:text-red-300 hover:bg-red-400/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"}`}
                      disabled={togglingPrinterId === printer.id}
                      onClick={() => togglePrinter(printer.id, printer.is_active)}
                    >
                      {togglingPrinterId === printer.id ? "Updating..." : printer.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                      disabled={deletingPrinterId === printer.id}
                      onClick={() => removePrinter(printer.id)}
                    >
                      {deletingPrinterId === printer.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
