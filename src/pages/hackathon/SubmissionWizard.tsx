import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubmissionWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSubId, setCompletedSubId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    teamName: "",
    institution: "",
    department: "",
    teamSize: "4",
    leaderName: "",
    leaderEmail: "",
    leaderPhone: "",
    problemStatement: "",
    problemDescription: "",
    repoUrl: "",
    demoUrl: "",
  });

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v2/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: "demo-event", // Usually taken from URL params
          team_name: formData.teamName,
          institution: formData.institution,
          department: formData.department,
          leader: {
            name: formData.leaderName,
            email: formData.leaderEmail,
            phone: formData.leaderPhone,
            institution: formData.institution,
            department: formData.department,
          },
          problem_statement: formData.problemStatement,
          problem_description: formData.problemDescription,
          repo_url: formData.repoUrl,
          demo_url: formData.demoUrl,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setCompletedSubId(resData.data.submission.submission_id);
      } else {
        alert("Submission failed: " + resData.message);
      }
    } catch (error) {
      alert("Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedSubId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
        <Card className="w-full max-w-lg bg-neutral-900 border-neutral-800 text-center py-12">
          <CardContent className="space-y-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Submission Successful!</h2>
              <p className="text-neutral-400">Your project has been securely submitted.</p>
            </div>
            <div className="bg-neutral-950 p-4 rounded-lg inline-block border border-neutral-800">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Permanent Submission ID</p>
              <p className="text-xl font-mono text-indigo-400 font-bold">{completedSubId}</p>
            </div>
            <p className="text-sm text-neutral-500">Please save this ID. It is your unique identifier for scoring.</p>
            <div className="pt-4">
              <Button onClick={() => navigate("/hackathon/dashboard")} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Submission</h1>
          <p className="text-neutral-400 mt-2">Complete the 3-step wizard to register your project.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= i ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                {i}
              </div>
              {i < 3 && <div className={`w-16 h-1 mx-2 rounded ${step > i ? 'bg-indigo-600' : 'bg-neutral-800'}`} />}
            </div>
          ))}
        </div>

        <Card className="bg-neutral-900 border-neutral-800 relative overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Step 1: Team Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName" className="text-neutral-300">Team Name *</Label>
                      <Input id="teamName" name="teamName" value={formData.teamName} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize" className="text-neutral-300">Team Size *</Label>
                      <Input id="teamSize" name="teamSize" type="number" min="1" max="4" value={formData.teamSize} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution" className="text-neutral-300">Institution *</Label>
                      <Input id="institution" name="institution" value={formData.institution} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-neutral-300">Department</Label>
                      <Input id="department" name="department" value={formData.department} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Step 2: Leader Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaderName" className="text-neutral-300">Full Name *</Label>
                      <Input id="leaderName" name="leaderName" value={formData.leaderName} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaderEmail" className="text-neutral-300">Email Address *</Label>
                      <Input id="leaderEmail" name="leaderEmail" type="email" value={formData.leaderEmail} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaderPhone" className="text-neutral-300">Phone Number *</Label>
                      <Input id="leaderPhone" name="leaderPhone" value={formData.leaderPhone} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-white mb-4">Step 3: Problem & Repository</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="problemStatement" className="text-neutral-300">Problem Title / Domain *</Label>
                      <Input id="problemStatement" name="problemStatement" value={formData.problemStatement} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="problemDescription" className="text-neutral-300">Description / Solution Approach</Label>
                      <Textarea id="problemDescription" name="problemDescription" value={formData.problemDescription} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="repoUrl" className="text-neutral-300">Repository URL *</Label>
                        <Input id="repoUrl" name="repoUrl" value={formData.repoUrl} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" placeholder="https://github.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demoUrl" className="text-neutral-300">Demo URL (Optional)</Label>
                        <Input id="demoUrl" name="demoUrl" value={formData.demoUrl} onChange={updateForm} className="bg-neutral-950 border-neutral-800 text-white" placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-4 border-t border-neutral-800">
              <Button
                variant="outline"
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {step < 3 ? (
                <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                  {isSubmitting ? "Submitting..." : "Submit Project"} <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
