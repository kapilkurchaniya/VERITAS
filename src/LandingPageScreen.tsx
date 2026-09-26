import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle2, Building, Activity, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPageScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-['IBM_Plex_Sans'] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-[0.28em] text-foreground">VERITAS</span>
            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-outline text-xs px-4"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Grade Execution Data</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              The truth behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                every build.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              VERITAS provides verified, immutable execution data for your construction projects. Track progress, review quality, and manage compliance from field to office seamlessly.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-primary px-6 py-3 text-base gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform"
              >
                Access Platform <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Abstract Hero Image / UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
              {/* Mock App Header */}
              <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
                <div className="h-32 w-full bg-muted/50 rounded-xl border border-border/50 animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-muted/30 rounded-xl border border-border/50 animate-pulse" />
                   <div className="h-24 bg-muted/30 rounded-xl border border-border/50 animate-pulse delay-75" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Unified workflows for all roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From the field agents capturing truth on the ground, to the reviewers ensuring compliance in the office.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Field Capture", desc: "Mobile-first data collection with offline support and geo-fenced verification." },
              { icon: FileCheck, title: "Review Queue", desc: "Streamlined QA/QC workflows with automated anomaly detection." },
              { icon: Building, title: "Project Overview", desc: "High-level insights and compliance tracking for project managers." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
