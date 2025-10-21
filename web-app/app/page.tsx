import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Play,
  Zap,
  TrendingUp,
  Shield,
  Award,
  Coins,
  ArrowRight,
  Sparkles,
  Upload,
  Users
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="xStream Logo" width={36} height={36} />
            <span className="text-xl font-light tracking-tight text-white">
              xStream
            </span>
          </div>
          <div className="hidden md:flex items-start gap-8">
            <Link href="/browse" className="text-sm text-neutral-400 hover:text-white transition-colors duration-300">
              Browse
            </Link>
            <Link href="/trending" className="text-sm text-neutral-400 hover:text-white transition-colors duration-300">
              Trending
            </Link>
            <Link href="/upload" className="text-sm text-neutral-400 hover:text-white transition-colors duration-300">
              Upload
            </Link>
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors duration-300">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <Badge>
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              The Future of Streaming
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Watch Everything.
              </span>
              <br />
              <span className="text-white font-extralight">
                Pay Precisely.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
              Experience video like never before. Pay exactly for what you watch, while creators earn
              <span className="text-white font-normal"> 95% of every second</span> in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-10">
              <Link href="/browse">
                <Button size="lg">
                  <Play className="w-4 h-4 mr-2" fill="black" />
                  Start Watching
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Start Creating
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-16 max-w-5xl mx-auto">
              {[
                { label: "Creator Share", value: "95%", icon: TrendingUp },
                { label: "Avg Savings", value: "60%", icon: Coins },
                { label: "Instant Payouts", value: "Real-time", icon: Zap },
                { label: "Skip Refunds", value: "100%", icon: Shield }
              ].map((stat, i) => (
                <Card key={i} className="text-center p-6 group">
                  <stat.icon className="w-6 h-6 mx-auto mb-3 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                  <div className="text-3xl font-extralight text-white mb-1.5">{stat.value}</div>
                  <div className="text-xs text-neutral-500 font-light tracking-wide uppercase">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gradient-to-b from-black via-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
              Fundamentally Different
            </h2>
            <p className="text-base text-neutral-400 font-light">
              Built for fairness. Designed for precision. Powered by innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Precision Payments",
                description: "Pay only for what you watch. Every second counts, nothing is wasted."
              },
              {
                icon: TrendingUp,
                title: "Creator Economics",
                description: "95% revenue share. The highest in the industry. Fair value for great content."
              },
              {
                icon: Shield,
                title: "Blockchain Integrity",
                description: "Built on Base. Every transaction is transparent, secure, and verifiable."
              },
              {
                icon: Award,
                title: "Digital Collectibles",
                description: "Unlock exclusive NFTs through engagement. Rewards that recognize your journey."
              },
              {
                icon: Coins,
                title: "Real-Time Rewards",
                description: "Instant settlements. No delays. Creators earn as viewers watch."
              },
              {
                icon: Users,
                title: "Creator Empowerment",
                description: "Complete control. Transparent analytics. Direct community connection."
              }
            ].map((feature, i) => (
              <Card key={i} className="p-6 group">
                <feature.icon className="w-8 h-8 text-neutral-400 mb-5 group-hover:text-white group-hover:scale-105 transition-all duration-300" />
                <h3 className="text-lg font-light text-white mb-2.5">{feature.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
              Elegantly Simple
            </h2>
            <p className="text-base text-neutral-400 font-light">
              Three steps to a better way to watch and create.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect",
                description: "Link your wallet. Add funds. Begin your journey in seconds."
              },
              {
                step: "02",
                title: "Experience",
                description: "Watch premium content. Pay by the second. Leave anytime."
              },
              {
                step: "03",
                title: "Reward",
                description: "Earn digital collectibles. Support creators directly. Build your legacy."
              }
            ].map((step, i) => (
              <Card key={i} className="text-center p-8 group">
                <div className="text-6xl font-extralight text-white/10 group-hover:text-white/20 transition-colors duration-500 mb-5">
                  {step.step}
                </div>
                <h3 className="text-xl font-light text-white mb-3">{step.title}</h3>
                <p className="text-neutral-500 font-light leading-relaxed text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black via-neutral-950 to-black">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-white/[0.03] to-white/[0.01] text-center">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
              The Future of Video Streaming<br />Is Here
            </h2>
            <p className="text-base text-neutral-400 font-light mb-10 max-w-xl mx-auto">
              Join the revolution. Where every second matters and every creator thrives.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/browse">
                <Button size="lg">
                  <Play className="w-4 h-4 mr-2" fill="black" />
                  Explore Videos
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="xStream Logo" width={28} height={28} />
                <span className="text-base font-light text-white">xStream</span>
              </div>
              <p className="text-neutral-500 text-sm font-light leading-relaxed">
                Precision video monetization. Where every second creates value and every creator earns fairly.
              </p>
            </div>
            <div>
              <h4 className="font-light text-white mb-4 text-sm">Platform</h4>
              <div className="space-y-2">
                <Link href="/browse" className="block text-neutral-500 font-light hover:text-white transition text-sm">Browse</Link>
                <Link href="/trending" className="block text-neutral-500 font-light hover:text-white transition text-sm">Trending</Link>
                <Link href="/upload" className="block text-neutral-500 font-light hover:text-white transition text-sm">Upload</Link>
                <Link href="/dashboard" className="block text-neutral-500 font-light hover:text-white transition text-sm">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-light text-white mb-4 text-sm">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-neutral-500 font-light hover:text-white transition text-sm">Documentation</a>
                <a href="#" className="block text-neutral-500 font-light hover:text-white transition text-sm">Support</a>
              </div>
            </div>
            <div>
              <h4 className="font-light text-white mb-4 text-sm">Connect</h4>
              <div className="space-y-2">
                <a href="#" className="block text-neutral-500 font-light hover:text-white transition text-sm">Twitter</a>
                <a href="#" className="block text-neutral-500 font-light hover:text-white transition text-sm">Discord</a>
                <a href="#" className="block text-neutral-500 font-light hover:text-white transition text-sm">GitHub</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-neutral-600 text-xs font-light">
            © 2025 xStream. Crafted with precision. Built for the future.
          </div>
        </div>
      </footer>
    </div>
  );
}
