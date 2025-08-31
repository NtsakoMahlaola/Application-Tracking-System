import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const LEADERSHIP_OPTIONS = [
  'Sub Warden',
  'House Committee',
  'Mentor',
  'Floor Rep',
  'Entertainment Committee',
  'PR & Brands Committee',
  'Tutor',
  'Sports Committee',
  'Discipline Committee',
  'IEC (Independent Electoral Commission)',
  'Audit Committee',
  'None of the above'
];

interface LeadershipSelectionProps {
  onComplete: (data: {
    name: string;
    surname: string;
    studentNumber: string;
    leadershipRoles: string[];
    otherRole?: string;
  }) => void;
}

export const LeadershipSelection = ({ onComplete }: LeadershipSelectionProps) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherRole, setOtherRole] = useState('');

  const handleRoleChange = (role: string) => {
    if (role === 'None of the above') {
      setSelectedRoles(['None of the above']);
      setShowOtherInput(false);
      return;
    }

    setSelectedRoles(prev => {
      const newRoles = prev.includes(role)
        ? prev.filter(r => r !== role && r !== 'None of the above')
        : [...prev.filter(r => r !== 'None of the above'), role];
      
      setShowOtherInput(newRoles.includes('Other'));
      return newRoles;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !surname || !studentNumber) {
      alert('Please fill in all required fields');
      return;
    }
    
    const data = {
      name,
      surname,
      studentNumber,
      leadershipRoles: selectedRoles.includes('Other') && otherRole 
        ? [...selectedRoles.filter(r => r !== 'Other'), otherRole]
        : selectedRoles,
      ...(selectedRoles.includes('Other') && { otherRole })
    };
    
    onComplete(data);
  };

  return (
    <Card className="p-6 mb-8 bg-gradient-card border-0 shadow-soft">
      <h2 className="text-2xl font-semibold mb-6 text-center">Application Summary</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="studentNumber">Student Number *</Label>
            <Input
              id="studentNumber"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="block mb-3">Leadership Structure Participation</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {LEADERSHIP_OPTIONS.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleChange(role)}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor={`role-${role}`} className="text-sm font-normal">
                  {role}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="role-other"
                checked={showOtherInput}
                onCheckedChange={() => {
                  const newValue = !showOtherInput;
                  setShowOtherInput(newValue);
                  if (newValue) {
                    setSelectedRoles(prev => [...prev.filter(r => r !== 'None of the above'), 'Other']);
                  } else {
                    setSelectedRoles(prev => prev.filter(r => r !== 'Other'));
                  }
                }}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="role-other" className="text-sm font-normal">
                Other
              </Label>
            </div>
          </div>

          {showOtherInput && (
            <div className="mt-3">
              <Input
                placeholder="Please specify"
                value={otherRole}
                onChange={(e) => setOtherRole(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-button hover:opacity-90">
            Continue to Upload
          </Button>
        </div>
      </form>
    </Card>
  );
};
