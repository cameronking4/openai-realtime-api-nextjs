import React, { useState } from 'react';
import AudioProcessor from './audio-processor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface AudioSettingsProps {
  // Add your props here
}

const AudioSettings: React.FC<AudioSettingsProps> = (props) => {
  const [isNoiseSuppressionEnabled, setIsNoiseSuppressionEnabled] = useState(true);
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);

  const handleProcessedStreamReady = (stream: MediaStream) => {
    setProcessedStream(stream);
    // You can use the processed stream here or pass it to other components
    console.log('Processed stream ready:', stream);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Settings</CardTitle>
        <CardDescription>Configure your microphone and audio processing options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="noise-suppression">Background Noise Suppression</Label>
            <p className="text-sm text-muted-foreground">
              Reduce background noise using AI-powered noise cancellation
            </p>
          </div>
          <Switch
            id="noise-suppression"
            checked={isNoiseSuppressionEnabled}
            onCheckedChange={setIsNoiseSuppressionEnabled}
          />
        </div>
        
        {isNoiseSuppressionEnabled && (
          <div className="pt-2">
            <AudioProcessor 
              isEnabled={isNoiseSuppressionEnabled}
              onProcessedStreamReady={handleProcessedStreamReady}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioSettings; 