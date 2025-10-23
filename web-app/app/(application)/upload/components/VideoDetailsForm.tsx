import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video } from "lucide-react";

interface VideoDetailsFormProps {
  videoFile: File | null;
  title: string;
  description: string;
  category: string;
  tags: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  formatFileSize: (bytes: number) => string;
}

export default function VideoDetailsForm({
  videoFile,
  title,
  description,
  category,
  tags,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onTagsChange,
  onBack,
  onNext,
  formatFileSize,
}: VideoDetailsFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white font-light">Video Details</CardTitle>
          <CardDescription className="text-white/70 font-light">
            Add information about your video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videoFile && (
            <div className="bg-white/[0.02] p-4 rounded-lg mb-4 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70 font-light">Selected file:</p>
                  <p className="text-white font-light">{videoFile.name}</p>
                  <p className="text-xs text-white/50 mt-1 font-light">
                    {formatFileSize(videoFile.size)}
                  </p>
                </div>
                <Video className="h-8 w-8 text-white/50" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-light mb-2 text-white">
              Title <span className="text-white/70">*</span>
            </label>
            <Input
              placeholder="Enter video title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-white/50 mt-1 font-light">
              {title.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-light mb-2 text-white">
              Description
            </label>
            <Textarea
              placeholder="Describe your video content"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-white/50 mt-1 font-light">
              {description.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-light mb-2 text-white">
              Category
            </label>
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="News">News</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-light mb-2 text-white">
              Tags
            </label>
            <Input
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => onTagsChange(e.target.value)}
            />
            <p className="text-xs text-white/50 mt-1 font-light">
              Example: blockchain, tutorial, crypto, x402
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!title.trim()}>
          Next: Pricing
        </Button>
      </div>
    </div>
  );
}
