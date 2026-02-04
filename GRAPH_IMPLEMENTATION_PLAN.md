# Graph Visualization Implementation Plan
## Based on Recurse.cc Approach

### Analysis of Recurse.cc Implementation

Based on the [Recurse website](https://www.recurse.cc/), their graph visualization features:

1. **Professional Graph Library**: Uses D3.js force-directed layout or similar (not custom implementation)
2. **Hierarchical Sidebar**: Left sidebar with expandable tree structure showing semantic categories
3. **Node Typing**: Different node shapes/icons representing different semantic types (circles, squares, triangles)
4. **Depth/Level Control**: Ability to explore graph at different depths (Level: 0, 1, 2, etc.)
5. **Smooth Interactions**: Zoom, pan, drag nodes, hover tooltips
6. **Visual Clustering**: Related nodes cluster together naturally
7. **Search Integration**: Search bar that filters nodes in real-time
8. **Performance**: Handles large graphs efficiently with proper rendering optimizations

### Current State vs. Target State

**Current Implementation:**
- Custom force simulation (manual physics)
- Basic node rendering (letters: T, A, K)
- Simple sidebar (category list)
- Basic zoom/pan
- No depth control
- Nodes overlap/cluster issues

**Target State (Recurse-like):**
- Professional graph library (D3.js or react-force-graph)
- Rich node visualization (shapes, icons, labels)
- Hierarchical sidebar with semantic organization
- Depth/level exploration
- Smooth, performant rendering
- Better node spacing and clustering

---

## Implementation Plan

### Phase 1: Replace Custom Force Simulation with D3.js

**Why D3.js?**
- Industry-standard force-directed layout
- Better performance and stability
- Handles large graphs efficiently
- Smooth animations out of the box
- Well-documented and maintained

**Steps:**
1. Install D3.js: `npm install d3 @types/d3`
2. Replace custom force simulation with `d3.forceSimulation()`
3. Configure forces:
   - `d3.forceManyBody()` - repulsion between nodes
   - `d3.forceLink()` - attraction along edges
   - `d3.forceCenter()` - center gravity
   - `d3.forceCollide()` - prevent overlap
4. Use D3's tick events for smooth animation

**Benefits:**
- Better node spacing (no overlap)
- More stable layout
- Better performance
- Smoother animations

---

### Phase 2: Enhanced Node Visualization

**Current:** Simple circles with letters (T, A, K)

**Target:** Rich visual representation like Recurse

**Implementation:**
1. **Node Shapes by Type:**
   - Tools: Circle with tool icon
   - Collections: Square with collection icon
   - Articles: Triangle with document icon
   - Frameworks: Hexagon with framework icon

2. **Node Sizing:**
   - Size based on connection count (more connections = larger)
   - Minimum size: 20px, Maximum: 40px

3. **Node Labels:**
   - Show title on hover (already implemented)
   - Optional: Show abbreviated title below node for important nodes
   - Use different font sizes based on zoom level

4. **Node Colors:**
   - Keep category-based colors
   - Add gradient/shadow for depth
   - Highlight selected nodes more prominently

5. **Icons Instead of Letters:**
   - Use SVG icons (tool, collection, article icons)
   - Or use emoji/unicode symbols
   - Make icons scale with node size

---

### Phase 3: Hierarchical Sidebar (Like Recurse)

**Current:** Simple category list

**Target:** Tree structure with semantic organization

**Implementation:**
1. **Organize by Semantic Categories:**
   - Group by tag categories (sustainability, innovation, etc.)
   - Show nested structure
   - Expandable/collapsible sections

2. **Visual Indicators:**
   - Icons for each category
   - Count of items in each category
   - Highlight selected items

3. **Search Integration:**
   - Real-time filtering
   - Highlight matching nodes in graph
   - Show search results count

4. **Node Selection:**
   - Click sidebar item to select/highlight node
   - Show selected nodes in sidebar
   - "Select all" functionality

---

### Phase 4: Depth/Level Control

**Current:** Shows all nodes at once

**Target:** Explore graph at different depths

**Implementation:**
1. **Level System:**
   - Level 0: Only selected/root nodes
   - Level 1: Direct connections
   - Level 2: Connections of connections
   - Level N: N-hop connections

2. **Controls:**
   - Level slider or +/- buttons
   - Show current level
   - Animate transitions between levels

3. **Progressive Disclosure:**
   - Start with fewer nodes
   - Expand to show more connections
   - Fade out distant nodes

4. **Focus Mode:**
   - Click node to focus on it
   - Show only its connections at current level
   - Center view on focused node

---

### Phase 5: Performance Optimizations

**Issues to Address:**
- Large graphs can be slow
- Many nodes cause rendering lag
- Smooth interactions needed

**Solutions:**
1. **Virtualization:**
   - Only render visible nodes (viewport culling)
   - Use canvas instead of SVG for large graphs
   - Implement level-of-detail rendering

2. **Data Structures:**
   - Use spatial indexing (quadtree) for fast lookups
   - Cache computed positions
   - Debounce expensive operations

3. **Rendering:**
   - Use `requestAnimationFrame` for smooth updates
   - Batch DOM updates
   - Use CSS transforms for pan/zoom

4. **Graph Filtering:**
   - Filter nodes/edges before rendering
   - Use minWeight threshold (already implemented)
   - Limit max nodes shown

---

### Phase 6: Enhanced Interactions

**Current:** Basic click, hover, drag

**Target:** Rich, intuitive interactions

**Implementation:**
1. **Node Interactions:**
   - Click: Select node
   - Double-click: Focus on node (show only its connections)
   - Drag: Reposition node (temporarily fix position)
   - Hover: Show tooltip with full information

2. **Edge Interactions:**
   - Hover edge: Highlight edge and connected nodes
   - Show edge weight/relationship type
   - Click edge: Show relationship details

3. **View Controls:**
   - Zoom: Mouse wheel, buttons, pinch
   - Pan: Click-drag background
   - Fit to view: Show all nodes
   - Reset: Return to default view

4. **Keyboard Shortcuts:**
   - `+/-`: Zoom in/out
   - `Arrow keys`: Pan
   - `F`: Fit to view
   - `R`: Reset
   - `Esc`: Clear selection

---

### Phase 7: Visual Polish

**Enhancements:**
1. **Animations:**
   - Smooth node transitions
   - Fade in/out for filtered nodes
   - Smooth zoom/pan
   - Elastic node dragging

2. **Styling:**
   - Better color scheme
   - Subtle shadows/depth
   - Smooth gradients
   - Consistent with site theme

3. **Layout Algorithms:**
   - Try different layouts (circular, hierarchical, radial)
   - Allow users to switch layouts
   - Save preferred layout

4. **Clustering:**
   - Group related nodes visually
   - Show cluster boundaries
   - Collapse/expand clusters

---

## Recommended Technology Stack

### Option 1: D3.js (Recommended)
```bash
npm install d3 @types/d3
```
- **Pros:** Industry standard, powerful, flexible
- **Cons:** Steeper learning curve, more code to write
- **Best for:** Full control, custom requirements

### Option 2: react-force-graph-2d
```bash
npm install react-force-graph-2d
```
- **Pros:** React-friendly, easier to use, good performance
- **Cons:** Less customization, additional dependency
- **Best for:** Quick implementation, React projects

### Option 3: Cytoscape.js
```bash
npm install cytoscape react-cytoscapejs
```
- **Pros:** Feature-rich, many layout algorithms
- **Cons:** Larger bundle size, more complex API
- **Best for:** Complex graph requirements

---

## Implementation Priority

### High Priority (Must Have)
1. ✅ Replace custom force simulation with D3.js
2. ✅ Fix node overlap issues
3. ✅ Better node visualization (icons, shapes)
4. ✅ Smooth zoom/pan (already implemented)

### Medium Priority (Should Have)
5. Hierarchical sidebar
6. Depth/level control
7. Performance optimizations
8. Enhanced hover tooltips (already implemented)

### Low Priority (Nice to Have)
9. Multiple layout algorithms
10. Keyboard shortcuts
11. Clustering visualization
12. Export graph as image

---

## Step-by-Step Implementation

### Step 1: Install D3.js
```bash
cd website
npm install d3 @types/d3
```

### Step 2: Refactor NetworkGraph Component
- Import D3 force simulation
- Replace custom physics with D3 forces
- Configure forces for optimal spacing
- Test with current data

### Step 3: Enhance Node Rendering
- Add SVG icons for node types
- Implement node shapes (circle, square, triangle)
- Add node labels (optional, based on zoom)
- Improve color scheme

### Step 4: Add Depth Control
- Implement level-based filtering
- Add level controls UI
- Animate level transitions
- Test with different depths

### Step 5: Improve Sidebar
- Organize by semantic categories
- Add tree structure
- Improve search integration
- Add selection indicators

### Step 6: Performance Tuning
- Implement viewport culling
- Optimize rendering
- Add loading states
- Test with large graphs

---

## Expected Outcomes

After implementation:
- ✅ No node overlap
- ✅ Smooth, performant rendering
- ✅ Professional appearance
- ✅ Better user experience
- ✅ Scalable to large graphs
- ✅ Similar to Recurse.cc quality

---

## References

- [Recurse.cc](https://www.recurse.cc/) - Reference implementation
- [D3.js Force Simulation](https://d3js.org/d3-force) - Documentation
- [react-force-graph-2d](https://github.com/vasturiano/react-force-graph) - Alternative library
- [D3.js Examples](https://observablehq.com/@d3/force-directed-graph) - Examples and tutorials
