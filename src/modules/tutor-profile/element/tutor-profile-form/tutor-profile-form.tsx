"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { toast } from "sonner";

import { useUpdateTutorProfile } from "@/entities/tutor/api/tutor-profile.query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import type { Json } from "@/shared/types/database.types";

type Props = {
  profile: {
    full_name: string | null;
    bio: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  };
  tutor: {
    headline: string | null;
    hourly_rate_min: number | null;
    hourly_rate_max: number | null;
    experience_years: number | null;
    languages: string[];
    website_url: string | null;
    linkedin_url: string | null;
    education: Json;
    certifications: Json;
  };
  publicUrl: string;
};

export function TutorProfileForm({ profile, tutor, publicUrl }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const updateProfile = useUpdateTutorProfile();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [headline, setHeadline] = useState(tutor.headline ?? "");
  const [minRate, setMinRate] = useState(tutor.hourly_rate_min ?? 20);
  const [maxRate, setMaxRate] = useState(tutor.hourly_rate_max ?? 60);
  const [exp, setExp] = useState(tutor.experience_years ?? 0);
  const [langs, setLangs] = useState(tutor.languages.join(", "));
  const [web, setWeb] = useState(tutor.website_url ?? "");
  const [li, setLi] = useState(tutor.linkedin_url ?? "");
  const [edu, setEdu] = useState(JSON.stringify(tutor.education ?? [], null, 2));
  const [cert, setCert] = useState(
    JSON.stringify(tutor.certifications ?? [], null, 2)
  );

  async function save() {
    setPending(true);
    let education: Json = [];
    let certifications: Json = [];
    try {
      education = JSON.parse(edu) as Json;
    } catch {
      toast.error("Education must be valid JSON array");
      setPending(false);
      return;
    }
    try {
      certifications = JSON.parse(cert) as Json;
    } catch {
      toast.error("Certifications must be valid JSON array");
      setPending(false);
      return;
    }
    const languages = langs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await updateProfile.mutateAsync({
        fullName,
        bio: bio || null,
        phone: phone || null,
        city: city || null,
        country: country || null,
        headline: headline || null,
        hourlyRateMin: minRate,
        hourlyRateMax: maxRate,
        experienceYears: exp || null,
        languages,
        websiteUrl: web.trim() === "" ? null : web,
        linkedinUrl: li.trim() === "" ? null : li,
        education,
        certifications,
      });
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
    setPending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="font-semibold">Public profile</h2>
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Min rate</Label>
            <Input
              type="number"
              value={minRate}
              onChange={(e) => setMinRate(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Max rate</Label>
            <Input
              type="number"
              value={maxRate}
              onChange={(e) => setMaxRate(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Experience (years)</Label>
          <Input
            type="number"
            value={exp}
            onChange={(e) => setExp(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Languages (comma-separated)</Label>
          <Input value={langs} onChange={(e) => setLangs(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={web} onChange={(e) => setWeb(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input value={li} onChange={(e) => setLi(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Education (JSON array)</Label>
          <Textarea value={edu} onChange={(e) => setEdu(e.target.value)} rows={5} className="font-mono text-xs" />
        </div>
        <div className="space-y-2">
          <Label>Certifications (JSON array)</Label>
          <Textarea value={cert} onChange={(e) => setCert(e.target.value)} rows={5} className="font-mono text-xs" />
        </div>
        <Button
          type="button"
          onClick={() => void save()}
          disabled={pending || updateProfile.isPending}
        >
          {pending || updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
      <div className="space-y-4">
        <h2 className="font-semibold">Contact & location</h2>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg border p-4 text-sm">
          <p className="text-muted-foreground">Live preview URL</p>
          <p className="mt-1 font-mono text-xs break-all">{publicUrl}</p>
          <p className="text-muted-foreground mt-3 text-xs">
            Use image upload (API) for avatar, cover, gallery, and certificates in
            a follow-up pass; fields editor can be extended with predefined
            subjects.
          </p>
        </div>
      </div>
    </div>
  );
}
