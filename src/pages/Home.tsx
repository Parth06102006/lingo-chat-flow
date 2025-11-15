import { motion } from 'framer-motion';
import { ArrowRight, Zap, FileText, Bot, Languages, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import FloatingLines from '@/components/FloatingLines';
import LanguageSymbols from '@/components/language-symbols';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Auto-redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: FileText,
      title: 'Smart PDF Upload',
      description: 'Upload and preview multilingual PDFs with instant language detection'
    },
    {
      icon: Bot,
      title: 'AI-Powered Q&A',
      description: 'Ask questions about your documents and get precise answers with source references'
    },
    {
      icon: Languages,
      title: 'Instant Translation',
      description: 'Translate any page to English with a single click'
    },
    {
      icon: MessageCircle,
      title: 'Session Management',
      description: 'Organize conversations and easily navigate between different topics'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Language Symbols Background Layer */}
      <LanguageSymbols />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Lines Background - positioned absolutely behind content */}
        <div className="absolute inset-0 w-full h-full">
          <FloatingLines 
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[10, 15, 20]}
            lineDistance={[8, 6, 4]}
            bendRadius={5.0}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
            linesGradient={['#1e40af', '#2563eb', '#60A5FA']}
            mixBlendMode="lighten"
          />
        </div>

        {/* Hero Content - positioned absolutely above background */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 transition-colors">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Document Analysis
            </Badge>
            
            {/* Logo and Title - Mobile: stacked, Desktop: side by side */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
              <motion.img 
                src="/logo.jpg" 
                alt="LingoDocs Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl object-cover shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 text-balance">
                LingoDocs
              </h1>
            </div>
            
            <h2 className="text-lg sm:text-xl md:text-2xl text-slate-800 max-w-2xl mx-auto leading-relaxed text-pretty font-semibold">
              Break Every Language Barrier
            </h2>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link to="/signup" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-slate-300 text-slate-700 hover:bg-blue-100 hover:border-blue-700 hover:text-zinc-700 transition-all duration-200"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4 text-balance">
              Powerful Features for Document Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto text-pretty">
              Everything you need to work with multilingual documents efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6 text-balance">
              Ready to Transform Your Document Workflow?
            </h2>
            
            <p className="text-xl text-slate-700 max-w-2xl mx-auto text-pretty">
              Join thousands of users who are already using LingoDocs to unlock insights from their multilingual documents.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link to="/signup" className="flex items-center gap-2">
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;