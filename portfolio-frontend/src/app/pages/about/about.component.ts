import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkillService } from '../../services/skill.service';
import { ToolService } from '../../services/tool.service';
import { Skill } from '../../models/skill.model';
import { Tool } from '../../models/tool.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private skillService = inject(SkillService);
  private toolService = inject(ToolService);

  skills: Skill[] = [];
  tools: Tool[] = [];
  loadingSkills = true;
  loadingTools = true;

  ngOnInit(): void {
    this.loadSkills();
    this.loadTools();
  }

  private loadSkills(): void {
    this.skillService.getAllSkills().subscribe({
      next: (res) => {
        this.skills = (res.data || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.loadingSkills = false;
      },
      error: (err) => {
        console.error('Failed to load skills:', err);
        this.loadingSkills = false;
      }
    });
  }

  private loadTools(): void {
    this.toolService.getAllTools().subscribe({
      next: (res) => {
        this.tools = (res.data || []).sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.loadingTools = false;
      },
      error: (err) => {
        console.error('Failed to load tools:', err);
        this.loadingTools = false;
      }
    });
  }

  getIconPreview(icon: string): string {
    if (!icon) return '🛠️';
    if (icon.startsWith('http')) return '🖼️';
    return icon;
  }
}