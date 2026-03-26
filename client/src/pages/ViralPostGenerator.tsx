import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Zap, MessageSquare, Link2, Sparkles, ChevronDown, ChevronUp, Lock } from "lucide-react";

type Platform = "facebook" | "linkedin" | "instagram";

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  instagram: "Instagram",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  linkedin: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

const START_STEPS = [
  { letter: "S", label: "Stop Scroll", desc: "Pattern-interrupt hook that stops the thumb" },
  { letter: "T", label: "Talk About Problem", desc: "Agitate the pain — make them feel seen" },
  { letter: "A", label: "Align With Audience", desc: "Show you understand them deeply" },
  { letter: "R", label: "Resolve the Problem", desc: "Deliver real value — not a teaser" },
  { letter: "T", label: "Tell Them What To Do", desc: "CTA directing to first comment (no link in body)" },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(label ? `${label} copied!` : "Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
      <Copy className="h-3.5 w-3.5" />
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

type ViralPostResult = {
  postBody: string;
  firstComment: string;
  engagementHooks: string[];
  platformVariants: { platform: string; postBody: string; firstComment: string }[];
};

export default function ViralPostGenerator() {
  const { isAuthenticated } = useAuth();
  const { data: userProfile } = trpc.user.me.useQuery(undefined, { enabled: isAuthenticated });
  const isPlatinum = userProfile?.plan === "platinum";

  const [form, setForm] = useState({
    topic: "",
    authorityProof: "",
    linkUrl: "",
    platform: "facebook" as Platform,
    businessDescription: "",
    targetAudience: "",
  });

  const [result, setResult] = useState<ViralPostResult | null>(null);
  const [activeVariant, setActiveVariant] = useState<string>("primary");
  const [showHooks, setShowHooks] = useState(false);

  const generateMutation = trpc.copy.generateViralPost.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setActiveVariant("primary");
      toast.success("Viral post generated! 🚀");
    },
    onError: (err) => {
      toast.error(err.message || "Generation failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic || !form.authorityProof || !form.linkUrl || !form.businessDescription || !form.targetAudience) {
      toast.error("Please fill in all fields.");
      return;
    }
    generateMutation.mutate(form);
  };

  const getDisplayPost = () => {
    if (!result) return null;
    if (activeVariant === "primary") return { postBody: result.postBody, firstComment: result.firstComment };
    const variant = result.platformVariants.find(v => v.platform.toLowerCase() === activeVariant);
    return variant ? { postBody: variant.postBody, firstComment: variant.firstComment } : null;
  };

  const displayPost = getDisplayPost();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Zap className="h-6 w-6 text-orange-400" />
              <h1 className="text-2xl font-bold tracking-tight">Viral Post Generator</h1>
              <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[0.6rem] font-bold">
                PLATINUM
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Generate algorithm-friendly viral posts using Austin Armstrong's S.T.A.R.T. framework — with First Comment CTA strategy built in.
            </p>
          </div>
        </div>

        {/* Platinum Gate */}
        {!isPlatinum && (
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-orange-400">Platinum Feature</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    The Viral Post Generator is available on BOSS Copy Platinum ($147/mo). Upgrade to unlock this feature plus the Website Analyser, Competitor Analyser, Website Copy Generator, and Image Generator.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* S.T.A.R.T. Framework Explainer */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              The S.T.A.R.T. Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {START_STEPS.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-black text-lg">{step.letter}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight">{step.label}</p>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5 leading-tight hidden sm:block">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-400 font-medium">
                ⚡ First Comment CTA Strategy: Links in post captions suppress organic reach. This tool puts your link in the first comment — the algorithm-friendly approach used by top creators.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="topic">Post Topic / Hook Idea</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Why most business owners waste money on ads that don't convert"
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    disabled={!isPlatinum}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="authorityProof">Your Authority / Credibility Proof</Label>
                  <Input
                    id="authorityProof"
                    placeholder="e.g. Helped 312 tradies generate $2.4M in leads in 90 days"
                    value={form.authorityProof}
                    onChange={e => setForm(f => ({ ...f, authorityProof: e.target.value }))}
                    disabled={!isPlatinum}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="linkUrl">Link URL (goes in First Comment)</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    placeholder="https://bosscopy.kabooyaaassistant.ai"
                    value={form.linkUrl}
                    onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                    disabled={!isPlatinum}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Primary Platform</Label>
                  <div className="flex gap-2">
                    {(["facebook", "linkedin", "instagram"] as Platform[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, platform: p }))}
                        disabled={!isPlatinum}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                          form.platform === p
                            ? `${PLATFORM_COLORS[p]} border-current`
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {PLATFORM_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="businessDescription">Your Business</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="e.g. AI copywriting tool that generates high-converting marketing copy using proven $174M revenue strategies"
                    value={form.businessDescription}
                    onChange={e => setForm(f => ({ ...f, businessDescription: e.target.value }))}
                    rows={2}
                    disabled={!isPlatinum}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="e.g. Small business owners and marketing managers who want more leads without hiring expensive copywriters"
                    value={form.targetAudience}
                    onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                    rows={2}
                    disabled={!isPlatinum}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isPlatinum || generateMutation.isPending}
                className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                size="lg"
              >
                <Zap className="h-4 w-4" />
                {generateMutation.isPending ? "Generating Viral Post..." : "Generate Viral S.T.A.R.T. Post"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && displayPost && (
          <div className="space-y-4">
            {/* Platform Variant Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveVariant("primary")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeVariant === "primary"
                    ? PLATFORM_COLORS[form.platform] + " border-current"
                    : "border-border text-muted-foreground"
                }`}
              >
                {PLATFORM_LABELS[form.platform]} (Primary)
              </button>
              {result.platformVariants.map(v => {
                const platform = v.platform.toLowerCase() as Platform;
                if (platform === form.platform) return null;
                return (
                  <button
                    key={v.platform}
                    onClick={() => setActiveVariant(platform)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      activeVariant === platform
                        ? (PLATFORM_COLORS[platform] || "bg-primary/10 text-primary border-primary/30") + " border-current"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {v.platform}
                  </button>
                );
              })}
            </div>

            {/* Post Body */}
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Post Body</CardTitle>
                    <Badge variant="outline" className="text-[0.6rem]">S.T.A.R.T. Framework</Badge>
                  </div>
                  <CopyButton text={displayPost.postBody} label="Post body" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono border border-border/30">
                  {displayPost.postBody}
                </div>
              </CardContent>
            </Card>

            {/* First Comment */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-amber-400" />
                    <CardTitle className="text-sm font-semibold text-amber-400">First Comment</CardTitle>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[0.6rem]">
                      POST THIS IMMEDIATELY AFTER
                    </Badge>
                  </div>
                  <CopyButton text={displayPost.firstComment} label="First comment" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-500/5 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap border border-amber-500/20">
                  {displayPost.firstComment}
                </div>
                <p className="text-xs text-amber-400/70 mt-2">
                  ⚡ Post this as the very first comment on your post to avoid algorithm suppression from links in captions.
                </p>
              </CardContent>
            </Card>

            {/* Engagement Hooks */}
            <Card>
              <CardHeader className="pb-2">
                <button
                  className="flex items-center justify-between w-full"
                  onClick={() => setShowHooks(h => !h)}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">5 Alternative Opening Hooks</CardTitle>
                    <Badge variant="outline" className="text-[0.6rem]">A/B Test These</Badge>
                  </div>
                  {showHooks ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
              </CardHeader>
              {showHooks && (
                <CardContent>
                  <div className="space-y-2">
                    {result.engagementHooks.map((hook, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                        <span className="text-xs font-bold text-primary shrink-0 mt-0.5">#{i + 1}</span>
                        <p className="text-sm flex-1">{hook}</p>
                        <CopyButton text={hook} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* All Platform Variants */}
            {result.platformVariants.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">All Platform Variants</CardTitle>
                  <p className="text-xs text-muted-foreground">Each variant is tone-adjusted for the platform's audience</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.platformVariants.map((variant, i) => {
                    const platform = variant.platform.toLowerCase() as Platform;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[0.6rem] ${PLATFORM_COLORS[platform] || "bg-muted text-muted-foreground"}`}>
                            {variant.platform}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground font-medium">Post Body</p>
                              <CopyButton text={variant.postBody} label={`${variant.platform} post`} />
                            </div>
                            <div className="bg-muted/20 rounded p-3 text-xs leading-relaxed whitespace-pre-wrap border border-border/20 max-h-48 overflow-y-auto">
                              {variant.postBody}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-amber-400 font-medium">First Comment</p>
                              <CopyButton text={variant.firstComment} label={`${variant.platform} comment`} />
                            </div>
                            <div className="bg-amber-500/5 rounded p-3 text-xs leading-relaxed whitespace-pre-wrap border border-amber-500/20 max-h-48 overflow-y-auto">
                              {variant.firstComment}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
