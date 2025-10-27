import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface PriceFilterProps {
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}

export default function PriceFilter({ maxPrice, priceRange, onPriceChange }: PriceFilterProps) {
  return (
    <Card className="p-4 space-y-3">
      <Label className="text-sm font-semibold">Цена покупки</Label>
      <div className="space-y-3">
        <Slider
          min={0}
          max={maxPrice}
          step={1000}
          value={priceRange}
          onValueChange={(value) => onPriceChange(value as [number, number])}
          className="w-full"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} ₽</span>
          <span>{priceRange[1].toLocaleString()} ₽</span>
        </div>
      </div>
    </Card>
  );
}
