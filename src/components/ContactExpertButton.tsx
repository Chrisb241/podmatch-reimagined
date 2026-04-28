import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createContactRequest } from "@/lib/contact";

interface Props {
  expertId: string;
  expertName: string;
  trigger?: React.ReactNode;
  className?: string;
}

const ContactExpertButton = ({ expertId, expertName, className }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClick = () => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (user.id === expertId) {
      toast.error("Vous ne pouvez pas vous contacter vous-même");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Le message est requis");
      return;
    }
    try {
      setSubmitting(true);
      await createContactRequest({
        recipient_id: expertId,
        subject,
        message,
      });
      toast.success("Demande envoyée à " + expertName);
      setOpen(false);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={handleClick}
        className={
          className ??
          "w-full gradient-primary shadow-button text-primary-foreground border-0"
        }
      >
        <Send className="h-4 w-4 mr-2" />
        Contacter
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="bg-card border rounded-xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-display font-semibold text-lg">
                  Contacter {expertName}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Présentez votre podcast et votre demande
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Sujet (optionnel)</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Invitation pour mon podcast..."
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bonjour, je serais ravi de vous inviter..."
                  rows={5}
                  required
                  maxLength={2000}
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {message.length}/2000
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="flex-1 gradient-primary text-primary-foreground border-0"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactExpertButton;
