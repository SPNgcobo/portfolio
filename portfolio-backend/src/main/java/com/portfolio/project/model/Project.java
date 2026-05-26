package com.portfolio.project.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    /*
     * BASIC
     */
    @TextIndexed
    private String title;

    @TextIndexed
    private String description;

    private String shortDescription;

    /*
     * DETAILED CONTENT
     */
    @TextIndexed
    private String problem;

    private String architecture;

    private String challenges;

    @TextIndexed
    private String solution;

    private String infoNote;

    /*
     * LINKS
     */
    private String github;

    private boolean githubVisible;

    private String liveDemoUrl;

    /*
     * MEDIA
     */
    private List<String> images;

    private String thumbnail;

    private List<String> videos;

    private List<String> documents;

    /*
     * STACK
     */
    @TextIndexed
    private List<String> techStack;

    @TextIndexed
    private List<String> tools;

    @TextIndexed
    private List<String> features;

    /*
     * FLAGS
     */
    private boolean featured;

    private boolean published;

    /*
     * ANALYTICS
     */
    private long viewCount;

    private long likes;

    private long commentsCount;

    private long githubClicks;

    private long demoClicks;

    private long detailClicks;

    /*
     * DATES
     */
    private Date createdAt;

    private Date updatedAt;

    /*
     * GETTERS & SETTERS
     */

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public String getArchitecture() {
        return architecture;
    }

    public void setArchitecture(String architecture) {
        this.architecture = architecture;
    }

    public String getChallenges() {
        return challenges;
    }

    public void setChallenges(String challenges) {
        this.challenges = challenges;
    }

    public String getSolution() {
        return solution;
    }

    public void setSolution(String solution) {
        this.solution = solution;
    }

    public String getInfoNote() {
        return infoNote;
    }

    public void setInfoNote(String infoNote) {
        this.infoNote = infoNote;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public boolean isGithubVisible() {
        return githubVisible;
    }

    public void setGithubVisible(boolean githubVisible) {
        this.githubVisible = githubVisible;
    }

    public String getLiveDemoUrl() {
        return liveDemoUrl;
    }

    public void setLiveDemoUrl(String liveDemoUrl) {
        this.liveDemoUrl = liveDemoUrl;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public List<String> getVideos() {
        return videos;
    }

    public void setVideos(List<String> videos) {
        this.videos = videos;
    }

    public List<String> getDocuments() {
        return documents;
    }

    public void setDocuments(List<String> documents) {
        this.documents = documents;
    }

    public List<String> getTechStack() {
        return techStack;
    }

    public void setTechStack(List<String> techStack) {
        this.techStack = techStack;
    }

    public List<String> getTools() {
        return tools;
    }

    public void setTools(List<String> tools) {
        this.tools = tools;
    }

    public List<String> getFeatures() {
        return features;
    }

    public void setFeatures(List<String> features) {
        this.features = features;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }

    public long getViews() {
        return viewCount;
    }

    public void setViews(long views) {
        this.viewCount = views;
    }

    public long getLikes() {
        return likes;
    }

    public void setLikes(long likes) {
        this.likes = likes;
    }

    public long getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(long commentsCount) {
        this.commentsCount = commentsCount;
    }

    public long getComments() {
        return commentsCount;
    }

    public void setComments(long comments) {
        this.commentsCount = comments;
    }

    public long getGithubClicks() {
        return githubClicks;
    }

    public void setGithubClicks(long githubClicks) {
        this.githubClicks = githubClicks;
    }

    public long getDemoClicks() {
        return demoClicks;
    }

    public void setDemoClicks(long demoClicks) {
        this.demoClicks = demoClicks;
    }

    public long getDetailClicks() {
        return detailClicks;
    }

    public void setDetailClicks(long detailClicks) {
        this.detailClicks = detailClicks;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}