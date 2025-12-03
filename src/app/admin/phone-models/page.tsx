"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPhoneModels, addPhoneModel, updatePhoneModel, deletePhoneModel } from "@/lib/data";
import type { PhoneModelDoc } from "@/lib/types";

const BRANDS = ["Apple", "Samsung", "OPPO", "Motorola", "Google", "Xiaomi"];

export default function AdminPhoneModelsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [models, setModels] = useState<PhoneModelDoc[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<"all" | string>("all");
  const [openEdit, setOpenEdit] = useState(false);
  const [editPayload, setEditPayload] = useState<{ id?: string; brand: string; modelName: string; isActive: boolean; sortOrder?: number }>({ brand: "Apple", modelName: "", isActive: true, sortOrder: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = () => {
    startTransition(async () => {
      const list = await getPhoneModels();
      setModels(list);
    });
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return models.filter(m => {
      const matchesSearch = search ? m.modelName.toLowerCase().includes(search.toLowerCase()) : true;
      const matchesBrand = brandFilter === "all" ? true : m.brand === brandFilter;
      return matchesSearch && matchesBrand;
    });
  }, [models, search, brandFilter]);

  const startAdd = () => {
    setEditPayload({ brand: "Apple", modelName: "", isActive: true, sortOrder: 0 });
    setOpenEdit(true);
  };

  const startEdit = (m: PhoneModelDoc) => {
    setEditPayload({ id: m.id, brand: m.brand, modelName: m.modelName, isActive: m.isActive, sortOrder: m.sortOrder ?? 0 });
    setOpenEdit(true);
  };

  const saveEdit = () => {
    const payload = editPayload;
    if (!payload.modelName.trim()) {
      toast({ title: "Model name is required", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        if (payload.id) {
          await updatePhoneModel(payload.id, { brand: payload.brand, modelName: payload.modelName, isActive: payload.isActive, sortOrder: payload.sortOrder });
        } else {
          await addPhoneModel({ brand: payload.brand, modelName: payload.modelName, isActive: payload.isActive, sortOrder: payload.sortOrder });
        }
        setOpenEdit(false);
        refresh();
        toast({ title: "Saved" });
      } catch {
        toast({ title: "Save failed", variant: "destructive" });
      }
    });
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deletePhoneModel(deleteId);
        setDeleteId(null);
        refresh();
        toast({ title: "Deleted" });
      } catch {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="font-headline text-2xl">Phone Models</div>
          <Sheet open={openEdit} onOpenChange={setOpenEdit}>
            <SheetTrigger asChild>
              <Button onClick={startAdd}><Plus className="mr-2 h-4 w-4" /> Add</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[520px]">
              <SheetHeader>
                <SheetTitle>{editPayload.id ? "Edit Model" : "New Model"}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm">Brand</label>
                  <Select value={editPayload.brand} onValueChange={(v)=>setEditPayload(p=>({ ...p, brand: v }))}>
                    <SelectTrigger className="w-full mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BRANDS.map(b => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">Model Name</label>
                  <Input className="mt-1" value={editPayload.modelName} onChange={(e)=>setEditPayload(p=>({ ...p, modelName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm">Active</label>
                  <Button variant={editPayload.isActive ? "default" : "outline"} className="ml-2" onClick={()=>setEditPayload(p=>({ ...p, isActive: !p.isActive }))}>
                    {editPayload.isActive ? "On" : "Off"}
                  </Button>
                </div>
                <div>
                  <label className="text-sm">Sort Order</label>
                  <Input type="number" className="mt-1" value={editPayload.sortOrder ?? 0} onChange={(e)=>setEditPayload(p=>({ ...p, sortOrder: parseInt(e.target.value || '0', 10) }))} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveEdit} disabled={isPending}>{isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : "Save"}</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Search by model name" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="All brands" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {BRANDS.map(b => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refresh}>{isPending ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : "Refresh"}</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Brand</th>
                  <th className="p-2">Model Name</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2">{m.brand}</td>
                    <td className="p-2">{m.modelName}</td>
                    <td className="p-2">
                      <Button variant={m.isActive ? "default" : "outline"} size="sm" onClick={()=>updatePhoneModel(m.id, { isActive: !m.isActive }).then(refresh)}>
                        {m.isActive ? "On" : "Off"}
                      </Button>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={()=>startEdit(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={()=>confirmDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v)=>!v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this model?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
