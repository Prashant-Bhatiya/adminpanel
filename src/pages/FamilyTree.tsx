import React, { useState } from "react";
import { GitFork, Search, Plus, Network, Info, ChevronRight, Download, Users, UserPlus } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface FamilyNode {
  id: string;
  name: string;
  relation: string;
  gender: "MALE" | "FEMALE";
  dob?: string;
  location?: string;
  mobile?: string;
  children?: FamilyNode[];
  spouse?: string;
}

// Mock Family Tree Data
const MOCK_TREE_ROOT: FamilyNode = {
  id: "ft_1",
  name: "Dharamsinh Barwad",
  relation: "Ancestor / Great Grandfather",
  gender: "MALE",
  dob: "1928-11-12",
  location: "Ahmedabad, Gujarat",
  spouse: "Ramilaben Barwad",
  children: [
    {
      id: "ft_2",
      name: "Rameshbhai Barwad",
      relation: "Grandfather (Elder Son)",
      gender: "MALE",
      dob: "1952-04-18",
      location: "Ahmedabad, Gujarat",
      spouse: "Savitaben Barwad",
      children: [
        {
          id: "ft_5",
          name: "Vijaybhai Barwad",
          relation: "Father",
          gender: "MALE",
          dob: "1978-08-22",
          location: "Ahmedabad, Gujarat",
          spouse: "Hetalben Barwad",
          children: [
            {
              id: "ft_8",
              name: "Piyush Barwad",
              relation: "Son (Self)",
              gender: "MALE",
              dob: "2002-09-05",
              location: "Ahmedabad, Gujarat",
            },
            {
              id: "ft_9",
              name: "Niral Barwad",
              relation: "Daughter",
              gender: "FEMALE",
              dob: "2005-12-14",
              location: "Ahmedabad, Gujarat",
            }
          ]
        },
        {
          id: "ft_6",
          name: "Alpaben Barwad",
          relation: "Aunt",
          gender: "FEMALE",
          dob: "1982-01-30",
          location: "Baroda, Gujarat",
          spouse: "Hasmukhbhai Parmar",
        }
      ]
    },
    {
      id: "ft_3",
      name: "Kirtibhai Barwad",
      relation: "Grandfather (Second Son)",
      gender: "MALE",
      dob: "1956-07-24",
      location: "Surat, Gujarat",
      spouse: "Manjulaben Barwad",
      children: [
        {
          id: "ft_7",
          name: "Sanjay Barwad",
          relation: "Uncle's Son / Cousin",
          gender: "MALE",
          dob: "1984-10-10",
          location: "Surat, Gujarat",
          spouse: "Dharmaben Barwad",
        }
      ]
    },
    {
      id: "ft_4",
      name: "Jashodaben Barwad",
      relation: "Grandmother (Daughter)",
      gender: "FEMALE",
      dob: "1960-03-05",
      location: "Rajkot, Gujarat",
      spouse: "Bhupatbhai Chavda",
    }
  ]
};

export default function FamilyTree() {
  const [selectedNode, setSelectedNode] = useState<FamilyNode>(MOCK_TREE_ROOT);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FamilyNode[]>([]);

  // Recursive search function
  const searchTree = (node: FamilyNode, query: string, results: FamilyNode[] = []): FamilyNode[] => {
    if (node.name.toLowerCase().includes(query.toLowerCase())) {
      results.push(node);
    }
    if (node.children) {
      node.children.forEach((child) => searchTree(child, query, results));
    }
    return results;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = searchTree(MOCK_TREE_ROOT, q);
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Family Tree Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Visualize relationships, administer lineage database trees, and verify family links.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Download size={14} className="mr-1.5" /> Export DB
          </Button>
          <Button size="sm">
            <Plus size={14} className="mr-1.5" /> Create Tree Root
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padded className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Network size={20} />
          </div>
          <div>
            <span className="block text-[11px] text-text-muted font-medium uppercase">Active Trees</span>
            <strong className="text-lg font-bold text-text">145 Trees</strong>
          </div>
        </Card>

        <Card padded className="flex items-center gap-4">
          <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <Users size={20} />
          </div>
          <div>
            <span className="block text-[11px] text-text-muted font-medium uppercase">Total Members</span>
            <strong className="text-lg font-bold text-text">8,420 Nodes</strong>
          </div>
        </Card>

        <Card padded className="flex items-center gap-4">
          <div className="h-10 w-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
            <GitFork size={20} />
          </div>
          <div>
            <span className="block text-[11px] text-text-muted font-medium uppercase">Avg Tree Depth</span>
            <strong className="text-lg font-bold text-text">5.4 Levels</strong>
          </div>
        </Card>

        <Card padded className="flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <UserPlus size={20} />
          </div>
          <div>
            <span className="block text-[11px] text-text-muted font-medium uppercase">Pending Links</span>
            <strong className="text-lg font-bold text-text">23 Requests</strong>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Search & Visualizer */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="min-h-[500px] flex flex-col gap-4">
            {/* Search Box */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm focus-within:border-primary">
                <Search size={16} className="text-text-muted" />
                <input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search family member node name..."
                  className="w-full bg-transparent outline-none text-text text-xs"
                />
              </div>

              {/* Search dropdown results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-surface border border-border rounded-xl shadow-panel overflow-hidden divide-y divide-border">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        setSelectedNode(result);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="w-full p-2.5 text-left text-xs hover:bg-surface-alt flex items-center justify-between text-text"
                    >
                      <div>
                        <strong>{result.name}</strong>
                        <span className="text-text-muted block text-[10px]">{result.relation}</span>
                      </div>
                      <ChevronRight size={14} className="text-text-muted" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tree Interactive Display */}
            <div className="flex-1 border border-border rounded-2xl bg-surface-alt/25 p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              <span className="absolute top-3 left-4 text-[10px] font-bold text-text-muted uppercase flex items-center gap-1">
                <Info size={12} /> Click nodes to view relationship profile
              </span>

              {/* Visual SVG Lines & Nodes Wrapper */}
              <div className="flex flex-col items-center gap-8 w-full max-w-2xl text-center z-10">
                {/* Root node */}
                <button
                  onClick={() => setSelectedNode(MOCK_TREE_ROOT)}
                  className={`px-4 py-2.5 rounded-xl border-2 transition-all shadow-md font-semibold text-xs ${
                    selectedNode.id === MOCK_TREE_ROOT.id
                      ? "border-primary bg-primary text-white scale-105"
                      : "border-primary/45 bg-surface text-text hover:border-primary"
                  }`}
                >
                  {MOCK_TREE_ROOT.name}
                  <span className="block text-[9px] font-normal opacity-85">Root Ancestor</span>
                </button>

                {/* Level 1: Great Grandfather's Children */}
                <div className="w-full grid grid-cols-3 gap-4 border-t-2 border-border/75 pt-6 relative before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:h-6 before:w-0.5 before:bg-border/75">
                  {MOCK_TREE_ROOT.children?.map((child) => (
                    <div key={child.id} className="flex flex-col items-center gap-6 relative">
                      <button
                        onClick={() => setSelectedNode(child)}
                        className={`px-3 py-2 rounded-xl border transition-all text-xs font-medium w-full max-w-[150px] shadow-sm ${
                          selectedNode.id === child.id
                            ? "border-primary bg-primary text-white scale-105"
                            : "border-border bg-surface text-text hover:border-primary/50"
                        }`}
                      >
                        {child.name}
                        <span className="block text-[8px] font-normal opacity-75">{child.relation.split(" ")[0]}</span>
                      </button>

                      {/* Level 2: Children's children (Only show first level or sub-nodes for active Grandfather) */}
                      {child.children && (
                        <div className="w-full flex flex-col items-center gap-4 border-t border-dashed border-border/70 pt-4 mt-2">
                          {child.children.map((grandchild) => (
                            <button
                              key={grandchild.id}
                              onClick={() => setSelectedNode(grandchild)}
                              className={`px-2.5 py-1.5 rounded-lg border transition-all text-[11px] w-full max-w-[130px] ${
                                selectedNode.id === grandchild.id
                                  ? "border-primary bg-primary/95 text-white scale-105"
                                  : "border-border bg-surface-alt/75 text-text-muted hover:text-text hover:border-primary/50"
                              }`}
                            >
                              {grandchild.name}
                              <span className="block text-[7px] opacity-75">{grandchild.relation.split(" ")[0]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Decorative Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            </div>
          </Card>
        </div>

        {/* Right Side: Selected Node Details */}
        <div className="lg:col-span-4">
          <Card className="h-full space-y-5">
            <h3 className="text-sm font-bold text-text mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={16} className="text-primary" /> Node Information
            </h3>

            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center text-center space-y-2 border-b border-border pb-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg ring-4 ring-primary/5">
                {selectedNode.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h4 className="font-bold text-text text-sm">{selectedNode.name}</h4>
                <Badge tone={selectedNode.gender === "MALE" ? "success" : "warning"}>
                  {selectedNode.gender}
                </Badge>
              </div>
            </div>

            {/* Relations list */}
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-text-muted block font-medium">Lineage Position</span>
                <strong className="text-text">{selectedNode.relation}</strong>
              </div>

              {selectedNode.spouse && (
                <div>
                  <span className="text-text-muted block font-medium">Spouse Relation</span>
                  <strong className="text-text">{selectedNode.spouse}</strong>
                </div>
              )}

              {selectedNode.dob && (
                <div>
                  <span className="text-text-muted block font-medium">Birth Date</span>
                  <strong className="text-text">{new Date(selectedNode.dob).toLocaleDateString()}</strong>
                </div>
              )}

              {selectedNode.location && (
                <div>
                  <span className="text-text-muted block font-medium">Current Location</span>
                  <strong className="text-text">{selectedNode.location}</strong>
                </div>
              )}
            </div>

            {/* Child nodes summary */}
            <div className="border-t border-border pt-4 space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Immediate Descendants</span>
              {selectedNode.children && selectedNode.children.length > 0 ? (
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {selectedNode.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedNode(child)}
                      className="w-full text-xs p-2 text-left bg-surface-alt hover:bg-surface border border-border rounded-xl flex items-center justify-between text-text hover:text-primary transition-all"
                    >
                      <div>
                        <span className="font-semibold block">{child.name}</span>
                        <span className="text-[10px] text-text-muted">{child.relation.split(" ")[0]}</span>
                      </div>
                      <ChevronRight size={12} className="text-text-muted" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted italic bg-surface-alt/30 p-2.5 rounded-xl text-center border border-dashed border-border">
                  No registered descendants in tree DB.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
