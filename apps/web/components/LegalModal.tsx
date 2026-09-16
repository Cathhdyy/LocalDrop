'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, CheckCircle2, AlertOctagon, ExternalLink } from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'license';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export function LegalModal({ isOpen, initialTab = 'privacy', onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl animate-slide-up overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Legal & Compliance</h3>
              <p className="text-[11px] text-muted-foreground">Privacy, Terms of Service, and Non-Commercial License</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-4 sm:px-6 pt-3 gap-2 border-b border-border/60 bg-muted/20">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'license'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>License (CC BY-NC 4.0)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-muted-foreground space-y-4 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-400">Zero Cloud Storage Guarantee</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    LocalDrop is engineered from the ground up to never store, retain, inspect, or upload your files to any central server or cloud database.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">1. Direct Peer-to-Peer Data Transfer</h4>
                <p>
                  All files, photos, videos, and shared text messages stream directly between your devices using encrypted WebRTC <code className="px-1 py-0.5 rounded bg-muted">RTCDataChannel</code> connections. Data transfers traverse your local Wi-Fi / LAN interface whenever devices are on the same network.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">2. Ephemeral WebSocket Signaling</h4>
                <p>
                  The WebSocket signaling server exists solely to coordinate the initial connection handshake (Session Description Protocol offers/answers and ICE candidates). Once devices establish a direct WebRTC peer connection, signaling carries zero payload data. Signaling tokens and room sessions are destroyed immediately upon disconnect.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">3. Browser Local Storage</h4>
                <p>
                  LocalDrop uses browser <code className="px-1 py-0.5 rounded bg-muted">localStorage</code> exclusively on your device for user preferences:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Your customized device nickname (e.g. "My MacBook").</li>
                  <li>UI theme preference (Dark or Light mode).</li>
                  <li>Audio chime mute preference.</li>
                  <li>Recent transfer history metadata (filename and size only, never file contents).</li>
                </ul>
                <p>This data never leaves your browser and can be cleared at any time in Settings.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">4. Zero Trackers, Analytics, or Cookies</h4>
                <p>
                  We do not use advertising trackers, Google Analytics, third-party marketing cookies, or user tracking SDKs.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">5. GDPR & CCPA Compliance</h4>
                <p>
                  Because LocalDrop does not collect, store, or process personally identifiable information (PII) on any central server, the right to erasure is inherently respected by design.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">1. Acceptance of Terms</h4>
                <p>
                  By accessing or using LocalDrop (via web, desktop, CLI, or self-hosted instances), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">2. Permitted Use & Non-Commercial License</h4>
                <p>
                  LocalDrop is provided for personal, educational, research, and non-commercial device sharing purposes. Commercial use, bundling for resale, or monetizing LocalDrop infrastructure without explicit prior written authorization is strictly prohibited under the Creative Commons CC BY-NC 4.0 license.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">3. Acceptable Use Policy</h4>
                <p>You agree not to use LocalDrop to:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Transfer malicious software, viruses, spyware, or ransomware.</li>
                  <li>Distribute copyrighted material without authorization from the rights holder.</li>
                  <li>Disrupt, overload, or conduct denial-of-service attacks against signaling servers or peer networks.</li>
                  <li>Attempt unauthorized access to remote devices without explicit owner consent.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">4. Disclaimer of Warranties</h4>
                <p>
                  LocalDrop is provided "AS IS" and "AS AVAILABLE" without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-foreground">5. Limitation of Liability</h4>
                <p>
                  In no event shall the authors, maintainers, or contributors of LocalDrop be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including loss of data, hardware malfunction, or business interruption) arising in any way out of the use of this software.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-foreground space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <Scale className="w-4 h-4" />
                  <span>Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  LocalDrop is an open source, source-available project dedicated to private, universal device sharing for individuals.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-3">Permission</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">🏢 Commercial Use</td>
                      <td className="p-3 text-center font-bold text-rose-400">❌ No</td>
                      <td className="p-3 text-muted-foreground">May not be used for commercial advantage or monetary compensation.</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">🛠️ Modification</td>
                      <td className="p-3 text-center font-bold text-emerald-400">✅ Yes</td>
                      <td className="p-3 text-muted-foreground">You may remix, transform, and build upon the material.</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">📦 Distribution</td>
                      <td className="p-3 text-center font-bold text-emerald-400">✅ Yes</td>
                      <td className="p-3 text-muted-foreground">You may copy, share, and redistribute the material in any format.</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">🔒 Private Use</td>
                      <td className="p-3 text-center font-bold text-emerald-400">✅ Yes</td>
                      <td className="p-3 text-muted-foreground">You may run, test, and use LocalDrop freely on your personal devices.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 pt-1">
                <h4 className="font-bold text-sm text-foreground">Attribution Requirement</h4>
                <p>
                  You must give appropriate credit to the original creator (<strong>Sanskar Sharma</strong> / LocalDrop Contributors), provide a link to the license, and indicate if changes were made.
                </p>
              </div>

              <a
                href="https://creativecommons.org/licenses/by-nc/4.0/legalcode"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                <span>Read official CC BY-NC 4.0 legal code</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary-hover text-white transition-all shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
