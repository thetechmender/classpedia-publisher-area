import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, DollarSign, Globe, Info, Percent } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FieldLabel = ({ label, required, tooltip }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export default function PricingStep({ data, onChange, errors, onNext, onBack }) {
  const royaltyPlan = data.royalty_plan || '70';
  const price = data.list_price || 0;
  const royalty = (price * (parseFloat(royaltyPlan) / 100)).toFixed(2);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Pricing & Royalties</h2>
          <p className="text-sm text-muted-foreground">Set your eBook price and royalty plan</p>
        </div>
      </div>

      {/* Territories */}
      <div>
        <FieldLabel label="Distribution Rights" required tooltip="Choose where your eBook will be available for purchase" />
        <RadioGroup
          value={data.territories || 'worldwide'}
          onValueChange={(v) => onChange({ territories: v })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <label className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
            (data.territories || 'worldwide') === 'worldwide' ? 'border-primary bg-accent/30' : 'border-border hover:border-primary/40'
          }`}>
            <RadioGroupItem value="worldwide" className="mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">All Territories (Worldwide)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Distribute everywhere rights are available</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
            data.territories === 'specific' ? 'border-primary bg-accent/30' : 'border-border hover:border-primary/40'
          }`}>
            <RadioGroupItem value="specific" className="mt-0.5" />
            <div>
              <span className="text-sm font-medium">Specific Territories</span>
              <p className="text-xs text-muted-foreground mt-1">Choose individual territories</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Royalty Plan */}
      <div>
        <FieldLabel label="Royalty Plan" required tooltip="Choose your royalty rate. The 70% plan has price requirements ($2.99–$9.99)." />
        <RadioGroup
          value={royaltyPlan}
          onValueChange={(v) => onChange({ royalty_plan: v })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <label className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
            royaltyPlan === '35' ? 'border-primary bg-accent/30' : 'border-border hover:border-primary/40'
          }`}>
            <RadioGroupItem value="35" className="mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">35% Royalty</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Flexible pricing: $0.99–$200.00. No delivery costs.
              </p>
            </div>
          </label>
          <label className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
            royaltyPlan === '70' ? 'border-primary bg-accent/30' : 'border-border hover:border-primary/40'
          }`}>
            <RadioGroupItem value="70" className="mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">70% Royalty</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Price range: $2.99–$9.99. Delivery costs apply.
              </p>
            </div>
          </label>
        </RadioGroup>
        {errors.royalty_plan && <p className="text-xs text-destructive mt-1">{errors.royalty_plan}</p>}
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel label="List Price" required tooltip="Set the selling price for your eBook" />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={data.list_price || ''}
              onChange={(e) => onChange({ list_price: e.target.value ? parseFloat(e.target.value) : '' })}
              placeholder="0.00"
              className={`pl-7 ${errors.list_price ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.list_price && <p className="text-xs text-destructive mt-1">{errors.list_price}</p>}
        </div>
        <div>
          <FieldLabel label="Currency" />
          <Select value={data.currency || 'USD'} onValueChange={(v) => onChange({ currency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Royalty Estimate */}
      {price > 0 && (
        <div className="bg-accent/60 rounded-xl p-5 border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Estimated Royalty</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">List Price</p>
              <p className="text-lg font-semibold mt-1">${price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Royalty Rate</p>
              <p className="text-lg font-semibold mt-1">{royaltyPlan}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Your Earning</p>
              <p className="text-lg font-semibold mt-1 text-primary">${royalty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}