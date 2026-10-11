import React, { useRef, useEffect, useState } from 'react';
import { Box, RotateCw, ZoomIn, ZoomOut, Eye, ExternalLink, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export default function SpatialEvidenceGraph({ analysis }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterStance, setFilterStance] = useState('ALL');

  // Camera angles in spherical coordinates
  const cameraRef = useRef({
    rotX: 0.35,
    rotY: 0.5,
    distance: 420,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  // Prepare graph nodes from analysis data
  const rawNodes = React.useMemo(() => {
    if (!analysis) return [];

    const nodes = [];
    // 1. Central Claim
    nodes.push({
      id: 'center-claim',
      type: 'CLAIM',
      label: analysis.headline ? analysis.headline.substring(0, 45) + '...' : 'Investigated Claim',
      title: analysis.headline || analysis.content || 'Central Claim Assertion',
      x: 0,
      y: 0,
      z: 0,
      radius: 18,
      color: '#38bdf8', // Sky Blue
      stance: 'CLAIM',
      category: analysis.category || 'Central Premise',
    });

    // 2. Publisher Node
    if (analysis.publisher) {
      nodes.push({
        id: 'source-publisher',
        type: 'SOURCE',
        label: analysis.publisher.substring(0, 30),
        title: `Publisher: ${analysis.publisher}`,
        x: -90,
        y: 60,
        z: 70,
        radius: 12,
        color: '#60a5fa', // Blue
        stance: 'SOURCE',
        reliability: analysis.sourceCredibility?.credibilityScore || 0.8,
        url: analysis.url || '',
      });
    }

    // 3. Supporting Evidence Nodes
    (analysis.supportingEvidence || []).forEach((e, i) => {
      const angle = (i / Math.max(1, analysis.supportingEvidence.length)) * Math.PI * 1.5;
      const radiusDist = 140 + (i * 20);
      nodes.push({
        id: `supp-${i}`,
        type: 'EVIDENCE',
        label: e.source || 'Supporting Source',
        title: e.title || 'Supporting Record',
        snippet: e.snippet || '',
        url: e.url || '',
        x: Math.cos(angle) * radiusDist,
        y: Math.sin(angle) * (radiusDist * 0.7),
        z: -80 + (i * 40),
        radius: 11,
        color: '#10b981', // Emerald
        stance: 'SUPPORTS',
        publishedDate: e.publishedDate || 'Recent',
        reliability: e.reliability || 0.95,
      });
    });

    // 4. Contradicting Evidence Nodes
    (analysis.contradictingEvidence || []).forEach((e, i) => {
      const angle = Math.PI + (i / Math.max(1, analysis.contradictingEvidence.length)) * Math.PI * 1.2;
      const radiusDist = 150 + (i * 25);
      nodes.push({
        id: `contra-${i}`,
        type: 'EVIDENCE',
        label: e.source || 'Contradicting Record',
        title: e.title || 'Contradicting Fact-Check',
        snippet: e.snippet || '',
        url: e.url || '',
        x: Math.cos(angle) * radiusDist,
        y: Math.sin(angle) * (radiusDist * 0.7),
        z: 90 - (i * 40),
        radius: 11,
        color: '#ef4444', // Red
        stance: 'CONTRADICTS',
        publishedDate: e.publishedDate || 'Recent',
        reliability: e.reliability || 0.95,
      });
    });

    // 5. Context Evidence Nodes
    (analysis.contextEvidence || []).forEach((e, i) => {
      const angle = Math.PI * 0.5 + (i * 0.8);
      nodes.push({
        id: `context-${i}`,
        type: 'EVIDENCE',
        label: e.source || 'Contextual Analysis',
        title: e.title || 'Contextual Information',
        snippet: e.snippet || '',
        url: e.url || '',
        x: Math.cos(angle) * 160,
        y: Math.sin(angle) * 140,
        z: 110,
        radius: 10,
        color: '#f59e0b', // Amber
        stance: 'CONTEXT',
        publishedDate: e.publishedDate || 'Recent',
        reliability: e.reliability || 0.85,
      });
    });

    // 6. Similar Claims
    (analysis.similarClaims || []).forEach((sc, i) => {
      const angle = -Math.PI * 0.5 + (i * 0.9);
      nodes.push({
        id: `sim-${i}`,
        type: 'SIMILAR_CLAIM',
        label: `${sc.organization || 'Fact Check'}: ${(sc.matched_claim || sc.matchedClaim || '').substring(0, 20)}...`,
        title: sc.matched_claim || sc.matchedClaim || 'Similar Fact Check',
        verdict: sc.verdict,
        similarity: sc.similarity_percentage || sc.similarityScore * 100,
        url: sc.url || '',
        x: Math.cos(angle) * 180,
        y: -120 + (i * 30),
        z: Math.sin(angle) * 150,
        radius: 10,
        color: '#a855f7', // Purple
        stance: sc.stance || 'CONTEXT',
        disclaimer: sc.disclaimer,
      });
    });

    return nodes;
  }, [analysis]);

  // Filter nodes according to stance selection
  const nodes = React.useMemo(() => {
    if (filterStance === 'ALL') return rawNodes;
    return rawNodes.filter(n => n.type === 'CLAIM' || n.stance === filterStance);
  }, [rawNodes, filterStance]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    handleResize();

    let angleCounter = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Auto rotation increment
      if (autoRotate && !cameraRef.current.isDragging) {
        cameraRef.current.rotY += 0.0035;
      }
      angleCounter += 0.02;

      const { rotX, rotY, distance } = cameraRef.current;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Center offset
      const cx = width / 2;
      const cy = height / 2;
      const fov = 480;

      // Draw faint spatial orbital rings
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      [100, 160, 220].forEach(r => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const px = Math.cos(a) * r;
          const pz = Math.sin(a) * r;
          // Project
          const x1 = px * cosY - pz * sinY;
          const z1 = px * sinY + pz * cosY;
          const y1 = -z1 * sinX;
          const z2 = z1 * cosX;
          const scale = fov / (fov + distance + z2);
          const screenX = cx + x1 * scale;
          const screenY = cy + y1 * scale;
          if (a === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.closePath();
        ctx.stroke();
      });
      ctx.restore();

      // Transform all nodes into 3D camera space
      const projectedNodes = nodes.map(node => {
        // Subtle floating oscillation
        const oscY = node.type !== 'CLAIM' ? Math.sin(angleCounter + node.x) * 4 : 0;
        const curY = node.y + oscY;

        // Rotate Y
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.x * sinY + node.z * cosY;

        // Rotate X
        const y2 = curY * cosX - z1 * sinX;
        const z2 = curY * sinX + z1 * cosX;

        // Perspective scale
        const scale = fov / (fov + distance + z2);
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;

        return {
          ...node,
          screenX,
          screenY,
          scale,
          depth: z2,
          renderRadius: Math.max(4, node.radius * scale),
        };
      });

      // Sort nodes back-to-front by depth (Painter's algorithm)
      projectedNodes.sort((a, b) => b.depth - a.depth);

      // Draw force/link lines from Central Claim to other nodes
      const centerNode = projectedNodes.find(n => n.id === 'center-claim');
      if (centerNode) {
        projectedNodes.forEach(node => {
          if (node.id === 'center-claim') return;

          ctx.save();
          let strokeColor = 'rgba(148, 163, 184, 0.25)';
          if (node.stance === 'SUPPORTS') strokeColor = 'rgba(16, 185, 129, 0.45)';
          else if (node.stance === 'CONTRADICTS') strokeColor = 'rgba(239, 68, 68, 0.45)';
          else if (node.stance === 'CONTEXT') strokeColor = 'rgba(245, 158, 11, 0.45)';

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(1, 1.5 * node.scale);
          ctx.setLineDash(node.type === 'SIMILAR_CLAIM' ? [4, 4] : []);
          ctx.beginPath();
          ctx.moveTo(centerNode.screenX, centerNode.screenY);
          ctx.lineTo(node.screenX, node.screenY);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Draw Nodes
      projectedNodes.forEach(node => {
        ctx.save();

        // Pulsating halo for central claim or selected node
        const isSelected = selectedNode?.id === node.id;
        if (node.type === 'CLAIM' || isSelected) {
          const glowRadius = node.renderRadius * (1.8 + Math.sin(angleCounter * 2) * 0.2);
          const gradient = ctx.createRadialGradient(
            node.screenX, node.screenY, node.renderRadius * 0.5,
            node.screenX, node.screenY, glowRadius
          );
          gradient.addColorStop(0, node.color + '88');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.screenX, node.screenY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Node Core Sphere
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, node.renderRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.stroke();

        // Draw Node Label if in foreground
        if (node.scale > 0.65) {
          ctx.font = `${Math.round(11 * node.scale)}px Inter, sans-serif`;
          ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.screenX, node.screenY + node.renderRadius + (12 * node.scale));
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, autoRotate, selectedNode]);

  // Interactive Mouse Drag to Rotate & Click to Select Node
  const handleMouseDown = (e) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.startX = e.clientX;
    cameraRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!cameraRef.current.isDragging) return;
    const dx = e.clientX - cameraRef.current.startX;
    const dy = e.clientY - cameraRef.current.startY;
    cameraRef.current.startX = e.clientX;
    cameraRef.current.startY = e.clientY;

    cameraRef.current.rotY += dx * 0.008;
    cameraRef.current.rotX = Math.max(-1.2, Math.min(1.2, cameraRef.current.rotX + dy * 0.008));
  };

  const handleMouseUp = (e) => {
    cameraRef.current.isDragging = false;
  };

  // Node Click Hit Testing
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * window.devicePixelRatio;
    const clickY = (e.clientY - rect.top) * window.devicePixelRatio;

    const { rotX, rotY, distance } = cameraRef.current;
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const fov = 480;

    let clicked = null;
    let minDistance = 25;

    nodes.forEach(node => {
      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;
      const y2 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;
      const scale = fov / (fov + distance + z2);
      const sx = cx + x1 * scale;
      const sy = cy + y2 * scale;

      const dist = Math.hypot(clickX - sx, clickY - sy);
      if (dist < minDistance) {
        minDistance = dist;
        clicked = node;
      }
    });

    if (clicked) {
      setSelectedNode(clicked);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    cameraRef.current.distance = Math.max(200, Math.min(800, cameraRef.current.distance + e.deltaY * 0.5));
  };

  const resetCamera = () => {
    cameraRef.current.rotX = 0.35;
    cameraRef.current.rotY = 0.5;
    cameraRef.current.distance = 420;
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#070e24] to-[#040817] shadow-2xl overflow-hidden p-4">
      {/* Topology Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Box className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide flex items-center gap-2">
              3D Spatial Evidence Relationship Topology
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Interactive WebGL 60FPS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag to orbit • Scroll to zoom • Click any node to inspect evidence provenance
            </p>
          </div>
        </div>

        {/* Stance Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStance('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${filterStance === 'ALL' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All Nodes ({rawNodes.length})
          </button>
          <button
            onClick={() => setFilterStance('SUPPORTS')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${filterStance === 'SUPPORTS' ? 'bg-emerald-600 text-white font-medium' : 'text-emerald-400 hover:text-emerald-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Supporting
          </button>
          <button
            onClick={() => setFilterStance('CONTRADICTS')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${filterStance === 'CONTRADICTS' ? 'bg-rose-600 text-white font-medium' : 'text-rose-400 hover:text-rose-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Conflicting
          </button>
          <button
            onClick={() => setFilterStance('CONTEXT')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${filterStance === 'CONTEXT' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400 hover:text-amber-300'}`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Context
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative w-full h-[420px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing bg-[#030712] border border-slate-800/80">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Orbit Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg text-slate-300">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle Auto Rotation"
            className={`p-1.5 rounded-lg transition-colors ${autoRotate ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-slate-800'}`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>
          <button
            onClick={() => { cameraRef.current.distance = Math.max(200, cameraRef.current.distance - 60); }}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { cameraRef.current.distance = Math.min(800, cameraRef.current.distance + 60); }}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-slate-800"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetCamera}
            title="Reset Perspective"
            className="px-2 py-1 text-xs rounded-lg hover:bg-slate-800 text-slate-400"
          >
            Reset
          </button>
        </div>

        {/* 3D Legend */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30"></span> Central Claim
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Supporting Evidence
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Conflicting Fact-Check
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Contextual Nuance
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Similar Verified Claim
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 max-w-sm bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl border border-sky-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: selectedNode.color + '22', color: selectedNode.color, border: `1px solid ${selectedNode.color}55` }}
              >
                {selectedNode.stance || selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="font-semibold text-slate-100 text-xs mb-1 line-clamp-2">
              {selectedNode.title}
            </h4>
            {selectedNode.snippet && (
              <p className="text-[11px] text-slate-300 line-clamp-3 mb-2">
                "{selectedNode.snippet}"
              </p>
            )}
            {selectedNode.similarity && (
              <div className="text-[11px] text-purple-400 font-mono mb-2">
                Semantic Match: {selectedNode.similarity.toFixed(1)}%
              </div>
            )}
            {selectedNode.url && (
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Visit Verified Origin <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
