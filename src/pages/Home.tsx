import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FloatingDocs } from '@/components/3d/FloatingDocs'
import { useAuth } from '@/components/auth/AuthContext'
import { Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MessageCircle, Languages, Zap, ArrowRight, Bot } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
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
  ]

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Hero Section with 3D Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Document Analysis
            </Badge>
            
            <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              LingoDocs
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload, preview, and query multilingual PDFs using AI. Get answers with document references and instantly translate pages to any language.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button asChild size="lg" className="hero-gradient text-white shadow-elegant hover-lift">
                <Link to="/signup" className="flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="glass hover-lift">
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
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Document Intelligence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
                <Card className="notebook-panel hover-lift h-full p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Document Workflow?</h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of users who are already using LingoDocs to unlock insights from their multilingual documents.
            </p>
            <Button asChild size="lg" variant="secondary" className="hover-lift shadow-elegant">
              <Link to="/signup" className="flex items-center gap-2">
                Start Your Journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home