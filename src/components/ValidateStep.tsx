import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Edit3, Check, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import { ExtractedData } from './ApplicationForm';

interface ValidateStepProps {
  data: ExtractedData;
  onComplete: (data: ExtractedData) => void;
}

export const ValidateStep = ({ data, onComplete }: ValidateStepProps) => {
  const [formData, setFormData] = useState<ExtractedData>(data);
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});

  const toggleEditing = (section: string) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleArrayChange = (field: keyof ExtractedData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof ExtractedData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof ExtractedData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const InfoSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: { 
    title: string; 
    icon: any; 
    section: string; 
    children: React.ReactNode; 
  }) => (
    <Card className="p-6 mb-6 bg-gradient-card border-0 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleEditing(section)}
          className="flex items-center gap-2"
        >
          {editingSections[section] ? (
            <>
              <Check className="w-4 h-4" />
              Save
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Edit
            </>
          )}
        </Button>
      </div>
      {children}
    </Card>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Review Your Application</h2>
        <p className="text-muted-foreground">Please review and edit your extracted information from your CV and cover letter</p>
      </div>

      {/* Personal Information */}
      <InfoSection title="Personal Information" icon={User} section="personal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            {editingSections.personal ? (
              <Input
                id="full_name"
                value={formData.full_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 p-2 bg-muted rounded">{formData.full_name || 'Not provided'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            {editingSections.personal ? (
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 p-2 bg-muted rounded">{formData.email || 'Not provided'}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="phone">Phone Number</Label>
            {editingSections.personal ? (
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 p-2 bg-muted rounded">{formData.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </InfoSection>

      {/* Professional Summary */}
      <InfoSection title="Profile Summary" icon={User} section="summary">
        {editingSections.summary ? (
          <Textarea
            value={formData.profile_summary}
            onChange={(e) => setFormData(prev => ({ ...prev, profile_summary: e.target.value }))}
            rows={4}
            className="resize-none"
          />
        ) : (
          <p className="p-2 bg-muted rounded leading-relaxed">
            {formData.profile_summary}
          </p>
        )}
      </InfoSection>

      {/* Work Experience */}
      <InfoSection title="Work Experience" icon={Briefcase} section="experience">
        <div className="space-y-3">
          {formData.experience.map((exp, index) => (
            <div key={index} className="flex items-center gap-2">
              {editingSections.experience ? (
                <>
                  <Input
                    value={exp}
                    onChange={(e) => handleArrayChange('experience', index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('experience', index)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <p className="flex-1 p-2 bg-muted rounded">{exp}</p>
              )}
            </div>
          ))}
          {editingSections.experience && (
            <Button
              variant="outline"
              onClick={() => addArrayItem('experience')}
              className="w-full"
            >
              Add Experience
            </Button>
          )}
        </div>
      </InfoSection>

      {/* Education */}
      <InfoSection title="Education" icon={GraduationCap} section="education">
        <div className="space-y-3">
          {formData.education.map((edu, index) => (
            <div key={index} className="flex items-center gap-2">
              {editingSections.education ? (
                <>
                  <Input
                    value={edu}
                    onChange={(e) => handleArrayChange('education', index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('education', index)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <p className="flex-1 p-2 bg-muted rounded">{edu}</p>
              )}
            </div>
          ))}
          {editingSections.education && (
            <Button
              variant="outline"
              onClick={() => addArrayItem('education')}
              className="w-full"
            >
              Add Education
            </Button>
          )}
        </div>
      </InfoSection>

      {/* Leadership */}
      <InfoSection title="Leadership Roles" icon={Award} section="leadership">
        <div className="space-y-3">
          {formData.leadership.map((role, index) => (
            <div key={index} className="flex items-center gap-2">
              {editingSections.leadership ? (
                <>
                  <Input
                    value={role}
                    onChange={(e) => handleArrayChange('leadership', index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('leadership', index)}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <p className="flex-1 p-2 bg-muted rounded">{role}</p>
              )}
            </div>
          ))}
          {editingSections.leadership && (
            <Button
              variant="outline"
              onClick={() => addArrayItem('leadership')}
              className="w-full"
            >
              Add Leadership Role
            </Button>
          )}
        </div>
      </InfoSection>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          className="px-8 bg-gradient-button hover:opacity-90 transition-opacity"
          size="lg"
        >
          Continue to Application
        </Button>
      </div>
    </div>
  );
};