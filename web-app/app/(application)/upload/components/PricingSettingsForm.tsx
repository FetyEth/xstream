import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertCircle } from "lucide-react";

interface QualityOption {
  value: string;
  label: string;
  multiplier: number;
}

interface PricingSettingsFormProps {
  pricePerSecond: string;
  maxQuality: string;
  onPriceChange: (value: string) => void;
  onQualityChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  qualityOptions: QualityOption[];
}

export default function PricingSettingsForm({
  pricePerSecond,
  maxQuality,
  onPriceChange,
  onQualityChange,
  onBack,
  onNext,
  qualityOptions,
}: PricingSettingsFormProps) {
  const selectedOption = qualityOptions.find((opt) => opt.value === maxQuality);
  const availableQualities = qualityOptions.filter(
    (q) => selectedOption ? q.multiplier <= selectedOption.multiplier : false
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white font-light">
            <DollarSign className="h-5 w-5 mr-2" />
            Pricing Settings
          </CardTitle>
          <CardDescription className="text-white/70 font-light">
            Set your video pricing and quality options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light mb-2 text-white">
                Price per Second (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 font-light">
                  $
                </span>
                <Input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1"
                  placeholder="0.010"
                  value={pricePerSecond}
                  onChange={(e) => onPriceChange(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-white/50 mt-1 font-light">
                Recommended: $0.005 - $0.020 per second
              </p>
            </div>

            <div>
              <label className="block text-sm font-light mb-2 text-white">
                Maximum Quality
              </label>
              <Select value={maxQuality} onValueChange={onQualityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-white/50 mt-1 font-light">
                Higher quality = better viewing experience
              </p>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <h4 className="font-light text-white mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Pricing Preview (5 min video example)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableQualities.map((option) => (
                <div
                  key={option.value}
                  className="text-center bg-white/[0.02] p-3 rounded-lg border border-white/5"
                >
                  <Badge variant="outline" className="mb-2">
                    {option.value}
                  </Badge>
                  <p className="font-light text-white text-lg">
                    ${(parseFloat(pricePerSecond) * option.multiplier * 300).toFixed(2)}
                  </p>
                  <p className="text-xs text-white/70 font-light">per 5 min</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/70 mt-3 text-center font-light">
              Viewers pay only for what they watch. Quality adjusts automatically
              based on connection.
            </p>
          </div>

          {/* Upload Fee Info */}
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-light text-white mb-1">Upload Fee</h4>
                <p className="text-sm text-white/70 font-light">
                  A one-time fee of <strong className="font-normal">$0.50</strong> (paid
                  via x402) is required to upload to xStream. This helps maintain platform
                  quality and covers storage costs.
                </p>
              </div>
            </div>
          </div>

          {/* Platform Fee Info */}
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/10 backdrop-blur-xl">
            <h4 className="font-light text-white mb-2">Creator Earnings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70 font-light">Your Revenue Share:</span>
                <span className="text-white font-light">95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70 font-light">Platform Fee:</span>
                <span className="text-white/70 font-light">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review & Publish</Button>
      </div>
    </div>
  );
}
