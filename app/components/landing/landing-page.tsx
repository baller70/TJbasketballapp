
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Trophy, Calendar, Timer, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent of 8-year-old Alex",
      content: "HoopsQuest has transformed my son's basketball practice. He's more motivated than ever and I love being able to track his progress!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Parent of 10-year-old Emma",
      content: "The AI coaching tips are incredibly helpful. Emma has improved her shooting form dramatically in just 2 weeks.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Parent of 12-year-old Marcus",
      content: "Finally, a way to keep my kid engaged with basketball practice at home. The rewards system is genius!",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Play className="h-8 w-8 text-orange-600" />,
      title: "35+ Basketball Drills",
      description: "Age-appropriate drills for kids 6-13, from basic fundamentals to advanced skills"
    },
    {
      icon: <Timer className="h-8 w-8 text-orange-600" />,
      title: "Smart Timer System",
      description: "Built-in timer with voice guidance and progress tracking for every drill"
    },
    {
      icon: <Calendar className="h-8 w-8 text-orange-600" />,
      title: "Practice Scheduling",
      description: "Easy calendar system to plan and track daily basketball practice sessions"
    },
    {
      icon: <Trophy className="h-8 w-8 text-orange-600" />,
      title: "Achievement System",
      description: "Unlock badges, earn points, and level up as you complete drills and hit milestones"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Parent Dashboard",
      description: "Monitor your child's progress, receive notifications, and celebrate achievements together"
    },
    {
      icon: <Star className="h-8 w-8 text-orange-600" />,
      title: "AI Coaching Tips",
      description: "Get personalized feedback and motivational messages powered by AI"
    }
  ];

  const stats = [
    { number: "35+", label: "Basketball Drills" },
    { number: "24", label: "Achievement Badges" },
    { number: "6", label: "Challenge Types" },
    { number: "100%", label: "Fun Guaranteed" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HoopsQuest</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-gray-600 hover:text-orange-600 transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-orange-600 transition-colors">
                Testimonials
              </Link>
              <SignInButton>
                <button className="text-gray-600 hover:text-orange-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Get Started
                </Button>
              </SignUpButton>
            </nav>
            
            <div className="md:hidden">
              <SignInButton>
                <Button variant="outline" size="sm">Sign In</Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
                  Perfect for Ages 6-13
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  The Ultimate{' '}
                  <span className="text-orange-600">Basketball</span>{' '}
                  Accountability App
                </h1>
                <p className="text-xl text-gray-600 mt-6">
                  Transform your child's basketball journey with structured drills, progress tracking, and rewards that make practice fun and engaging.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton>
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
                <SignInButton>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-orange-200">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">No equipment needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Parent oversight</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-2xl" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Play?</h3>
                    <p className="text-gray-600">Join thousands of young athletes improving their game</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Improve
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive basketball training tools designed specifically for young athletes and their parents
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Parents Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from families using HoopsQuest
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-orange-100 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Child's Basketball Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have made basketball practice fun, engaging, and effective with HoopsQuest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignUpButton>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600 text-lg px-8 py-6">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">HoopsQuest</span>
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate basketball accountability app for kids aged 6-13 with parent oversight.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><SignInButton><button className="hover:text-white transition-colors">Sign In</button></SignInButton></li>
                <li><SignUpButton><button className="hover:text-white transition-colors">Get Started</button></SignUpButton></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="hover:text-white transition-colors">Help Center</span></li>
                <li><span className="hover:text-white transition-colors">Contact Us</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HoopsQuest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
