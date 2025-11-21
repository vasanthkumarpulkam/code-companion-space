import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Package, Settings2, FileText, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

interface TaskData {
  location: { street: string; unit: string };
  itemType?: string;
  taskSize?: string;
  details: string;
}

export default function ServiceRequestWizard() {
  const { category, subcategory } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [taskData, setTaskData] = useState<TaskData>({
    location: { street: '', unit: '' },
    details: '',
  });

  const decodedSubcategory = decodeURIComponent(subcategory || '');

  const handleNext = () => {
    if (step === 1 && !taskData.location.street) {
      toast.error('Please enter your task location');
      return;
    }
    if (step === 2 && !taskData.itemType) {
      toast.error('Please select an item type');
      return;
    }
    if (step === 3 && !taskData.taskSize) {
      toast.error('Please select task size');
      return;
    }
    if (step === 4 && !taskData.details.trim()) {
      toast.error('Please provide task details');
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigate(`/providers?service=${category}`);
    }
  };

  const updateLocation = (field: 'street' | 'unit', value: string) => {
    setTaskData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate(`/request-service/${category}`) : setStep(step - 1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold mb-8">{decodedSubcategory}</h1>

          {step === 1 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Your task location</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Street address"
                  value={taskData.location.street}
                  onChange={(e) => updateLocation('street', e.target.value)}
                  className="text-base py-6"
                />
                <Input
                  placeholder="Unit or apt #"
                  value={taskData.location.unit}
                  onChange={(e) => updateLocation('unit', e.target.value)}
                  className="text-base py-6"
                />
              </div>
              <Button onClick={handleNext} size="lg" className="w-full mt-8 gradient-primary">
                Continue
              </Button>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Your Items</h2>
              <p className="text-muted-foreground mb-6">
                What type of furniture do you need assembled or disassembled?
              </p>
              <RadioGroup value={taskData.itemType} onValueChange={(val) => setTaskData(prev => ({...prev, itemType: val}))}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="ikea" id="ikea" />
                    <Label htmlFor="ikea" className="flex-1 cursor-pointer">IKEA furniture items only</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="non-ikea" id="non-ikea" />
                    <Label htmlFor="non-ikea" className="flex-1 cursor-pointer">Other furniture items (non-IKEA)</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="flex-1 cursor-pointer">Both IKEA and non-IKEA furniture</Label>
                  </div>
                </div>
              </RadioGroup>
              <Button onClick={handleNext} size="lg" className="w-full mt-8 gradient-primary">
                Continue
              </Button>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Task options</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">How big is your task?</h3>
                  <RadioGroup value={taskData.taskSize} onValueChange={(val) => setTaskData(prev => ({...prev, taskSize: val}))}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="small" id="small" />
                        <Label htmlFor="small" className="flex-1 cursor-pointer">Small - Est. 1 hr</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="flex-1 cursor-pointer">Medium - Est. 2-3 hrs</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="flex-1 cursor-pointer">Large - Est. 4+ hrs</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <Button onClick={handleNext} size="lg" className="w-full mt-8 gradient-primary">
                Continue
              </Button>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-4">Tell us the details of your task</h2>
              <p className="text-muted-foreground mb-6">
                Start the conversation and tell your provider what you need done. This helps us show you only qualified and available providers for the job.
              </p>
              <Textarea
                placeholder="Provide a summary of what you need done. Be sure to include details like the size of your space, any equipment/tools needed, and how to get in."
                value={taskData.details}
                onChange={(e) => setTaskData(prev => ({...prev, details: e.target.value}))}
                className="min-h-[200px] text-base"
              />
              <p className="text-sm text-muted-foreground mt-4">
                If you need two or more providers, please post additional tasks for each provider needed.
              </p>
              <Button onClick={handleNext} size="lg" className="w-full mt-8 gradient-primary">
                Continue to Providers
              </Button>
            </Card>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`h-2 rounded-full transition-all ${
                  num === step ? 'w-8 bg-primary' : num < step ? 'w-2 bg-primary/50' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
