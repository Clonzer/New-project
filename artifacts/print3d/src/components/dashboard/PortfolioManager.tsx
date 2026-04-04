import { useEffect, useState } from "react";
import { createPortfolioItem, deletePortfolioItem, listPortfolio, type PortfolioItem } from "@/lib/portfolio-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";

export function PortfolioManager({ userId }: { userId: number }) {
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    tags: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const result = await listPortfolio(userId);
      setPortfolio(result.portfolio);
    } catch (error) {
      toast({ title: "Could not load portfolio", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const save = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast({ title: "Portfolio item needs a title and image", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createPortfolioItem(userId, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim(),
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      setForm({ title: "", description: "", imageUrl: "", tags: "" });
      toast({ title: "Portfolio item added", description: "This project now appears on your shop page." });
      await load();
    } catch (error) {
      toast({ title: "Could not add portfolio item", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (portfolioId: number) => {
    setDeletingId(portfolioId);
    try {
      await deletePortfolioItem(userId, portfolioId);
      await load();
    } catch (error) {
      toast({ title: "Could not remove portfolio item", description: getApiErrorMessage(error), variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
        <p className="text-sm text-zinc-500 mt-1">Show previous projects, finishes, and proof of work on your public shop.</p>
      </div>
      <div className="p-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Project title" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          <Input
            type="file"
            accept="image/*"
            className="bg-black/30 border-white/10 text-white text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-xs file:text-white"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 6 * 1024 * 1024) {
                toast({
                  title: "Image too large",
                  description: "Please use an image under 6MB for portfolio items.",
                  variant: "destructive",
                });
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                setForm((current) => ({
                  ...current,
                  imageUrl: typeof reader.result === "string" ? reader.result : current.imageUrl,
                }));
              };
              reader.readAsDataURL(file);
            }}
          />
          <Input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Or paste image URL" className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="What was made, what process was used, and what made this project interesting?" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="prototype, walnut, anodized..." className="bg-black/30 border-white/10 text-white h-11 rounded-xl" />
          <NeonButton glowColor="primary" className="w-full rounded-xl py-3" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving..." : "Add portfolio item"}
          </NeonButton>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-zinc-500">Loading portfolio...</p>
          ) : portfolio.length ? (
            portfolio.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      {item.description ? <p className="mt-1 text-sm text-zinc-400">{item.description}</p> : null}
                    </div>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => void remove(item.id)} disabled={deletingId === item.id}>
                      {deletingId === item.id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No portfolio items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
