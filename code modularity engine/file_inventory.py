"""
File inventory system to track all files and their analysis status.
Stores data in JSON format for cross-checking and reproducibility.
"""

import os
import json
from datetime import datetime
from config import EXCLUDED_DIRS, CODE_EXTENSIONS, REPORT_DIR


class FileInventory:
    """Tracks all files in a repository and their analysis status."""
    
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.inventory = {
            "repo_path": repo_path,
            "timestamp": datetime.now().isoformat(),
            "files": {},
            "summary": {
                "total_files": 0,
                "analyzed_files": 0,
                "skipped_files": 0,
                "failed_files": 0,
                "coverage_percent": 0.0,
            }
        }
        self._scan_repository()
    
    def _scan_repository(self):
        """Scan repo and record all files."""
        file_count = 0
        
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for fname in files:
                rel_path = os.path.relpath(os.path.join(root, fname), self.repo_path)
                rel_path = rel_path.replace("\\", "/")  # Normalize to forward slashes
                ext = os.path.splitext(fname)[1].lower()
                
                self.inventory["files"][rel_path] = {
                    "filename": fname,
                    "extension": ext,
                    "is_code_file": ext in CODE_EXTENSIONS,
                    "status": "pending",  # pending, analyzed, skipped, failed
                    "metrics": None,
                    "error": None,
                }
                file_count += 1
        
        self.inventory["summary"]["total_files"] = file_count
    
    def mark_analyzed(self, file_path: str, metrics: dict):
        """Mark a file as analyzed and store its metrics."""
        rel_path = os.path.relpath(file_path, self.repo_path).replace("\\", "/")
        if rel_path in self.inventory["files"]:
            self.inventory["files"][rel_path]["status"] = "analyzed"
            self.inventory["files"][rel_path]["metrics"] = metrics
            self.inventory["summary"]["analyzed_files"] += 1
    
    def mark_skipped(self, file_path: str, reason: str = "Not a code file"):
        """Mark a file as skipped."""
        rel_path = os.path.relpath(file_path, self.repo_path).replace("\\", "/")
        if rel_path in self.inventory["files"]:
            self.inventory["files"][rel_path]["status"] = "skipped"
            self.inventory["files"][rel_path]["error"] = reason
            self.inventory["summary"]["skipped_files"] += 1
    
    def mark_failed(self, file_path: str, error: str):
        """Mark a file as failed to analyze."""
        rel_path = os.path.relpath(file_path, self.repo_path).replace("\\", "/")
        if rel_path in self.inventory["files"]:
            self.inventory["files"][rel_path]["status"] = "failed"
            self.inventory["files"][rel_path]["error"] = error
            self.inventory["summary"]["failed_files"] += 1
    
    def update_coverage(self):
        """Calculate coverage percentage."""
        total = self.inventory["summary"]["total_files"]
        analyzed = self.inventory["summary"]["analyzed_files"]
        if total > 0:
            self.inventory["summary"]["coverage_percent"] = round(analyzed / total * 100, 2)
    
    def verify_completeness(self) -> dict:
        """Check if all code files have been analyzed."""
        code_files = {f: info for f, info in self.inventory["files"].items() if info["is_code_file"]}
        analyzed = [f for f, info in code_files.items() if info["status"] == "analyzed"]
        failed = [f for f, info in code_files.items() if info["status"] == "failed"]
        
        return {
            "total_code_files": len(code_files),
            "analyzed": len(analyzed),
            "failed": len(failed),
            "missing": len(code_files) - len(analyzed) - len(failed),
            "complete": len(analyzed) == len(code_files),
            "failed_files": failed,
            "message": "All code files analyzed successfully" if len(analyzed) == len(code_files)
                       else f"Warning: {len(code_files) - len(analyzed)} code files not analyzed"
        }
    
    def save_to_json(self, filename: str = None) -> str:
        """Save inventory to JSON file."""
        if filename is None:
            filename = f"inventory_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        file_path = os.path.join(REPORT_DIR, filename)
        self.update_coverage()
        
        with open(file_path, 'w') as f:
            json.dump(self.inventory, f, indent=2)
        
        return file_path
    
    def get_analyzed_files_by_extension(self) -> dict:
        """Group analyzed files by extension."""
        result = {}
        for fpath, info in self.inventory["files"].items():
            if info["status"] == "analyzed":
                ext = info["extension"]
                if ext not in result:
                    result[ext] = []
                result[ext].append({
                    "file": fpath,
                    "metrics": info["metrics"]
                })
        return result
    
    def get_summary_report(self) -> str:
        """Generate a text summary report."""
        self.update_coverage()
        summary = self.inventory["summary"]
        
        report = f"""
╔════════════════════════════════════════════════════════╗
║           FILE INVENTORY & ANALYSIS REPORT              ║
╚════════════════════════════════════════════════════════╝

Repository: {self.repo_path}
Timestamp:  {self.inventory["timestamp"]}

SUMMARY:
  Total files found:      {summary["total_files"]}
  Files analyzed:         {summary["analyzed_files"]}
  Files skipped:          {summary["skipped_files"]}
  Files failed:           {summary["failed_files"]}
  Coverage:               {summary["coverage_percent"]}%

COMPLETENESS CHECK:
"""
        completeness = self.verify_completeness()
        report += f"""
  Code files total:       {completeness["total_code_files"]}
  Code files analyzed:    {completeness["analyzed"]}
  Code files failed:      {completeness["failed"]}
  Code files missing:     {completeness["missing"]}
  
  Status: {'✅ COMPLETE' if completeness["complete"] else '❌ INCOMPLETE'}
  {completeness["message"]}
"""
        
        if completeness["failed_files"]:
            report += f"\nFAILED FILES:\n"
            for fname in completeness["failed_files"]:
                report += f"  - {fname}\n"
        
        return report
    
    def __str__(self):
        return self.get_summary_report()
