[![Reviewed by Hound](https://img.shields.io/badge/Reviewed_by-Hound-8E64B0.svg)](https://houndci.com)
[![.github/workflows/main.yaml](https://github.com/atlp-rwanda/e-commerce-mavericcks-bn/actions/workflows/main.yaml/badge.svg)](https://github.com/atlp-rwanda/e-commerce-mavericcks-bn/actions/workflows/main.yaml)
[![Coverage Status](https://coveralls.io/repos/github/atlp-rwanda/e-commerce-mavericcks-bn/badge.svg?branch=develop)](https://coveralls.io/github/atlp-rwanda/e-commerce-mavericcks-bn?branch=develop) [![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/your-username/your-repo-name/releases/tag/v1.0.0) ![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/atlp-rwanda/e-commerce-mavericcks-bn) [![Test Coverage](https://api.codeclimate.com/v1/badges/c73dab3934e9b2672420/test_coverage)](https://codeclimate.com/github/atlp-rwanda/e-commerce-mavericcks-bn/test_coverage)



<a href="https://nodejs.org/en">![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)</a> <a href="https://expressjs.com/">![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)</a> <a href="https://sequelize.org/">![Static Badge](https://img.shields.io/badge/Sequelize-blue?style=for-the-badge&logo=nodedotjs&logoColor=white)</a> <a href="https://www.docker.com/">![Static Badge](https://img.shields.io/badge/Docker-%23095CB0?style=for-the-badge&logo=docker&logoColor=white)</a> <a href="https://www.typescriptlang.org/">![Static Badge](https://img.shields.io/badge/Typescript-%234A5561?style=for-the-badge&logo=typescript&logoColor=white)</a> <a href="https://www.passportjs.org/">![Static Badge](https://img.shields.io/badge/Passport-%2372A98A?style=for-the-badge&logo=passport&logoSize=amg)</a> <a href="https://e-commerce-mavericcks-bn-staging-istf.onrender.com/api/docs/">![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)</a>









# e-commerce-mavericcks-bn

Backend for team Maverick's e-commerce website

## Table of Contents

1. [Project Overview](#1)
2. [User Categories/Roles](#2)
3. [Features found on the platform](#3)
4. [Tech Stack](#4)
5. [Installation](#5)
6. [Pivotal Tracker with GitHub Best Practices](#6)
7. [Setting up Swagger Documentations](#7)

<a id = "1"> </a>

## Project Overview

A platform providing a marketplace for buyers and sellers to meet:

The platform serves as a meeting point for buyers and sellers, where each seller operates a virtual "stall" showcasing their products. Sellers have full control over their inventory, allowing them to manage stock levels, adjust prices, and offer discounts. Despite similarities, different sellers can offer identical items.

Shoppers can freely navigate between stalls to find the best deals, selecting items from various sellers and adding them to their shopping bag. They can modify their bag's contents as they browse. Payments are processed at checkout, and items can be returned to the stall before purchase. Market owners and administrators have comprehensive access, enabling them to view all sellers' stock and inspect shoppers' bags.

<a id = "2"> </a>

## User Categories/Roles

1. **Guest:** Anyone who has not yet signed in to the platform.

2. **User/Buyer:** Someone who has an account but also is willing to buy products via the platform.

3. **Vendor:** someone with an account but and has products to sell via the platform.

4. **Admins:** someone who has access to the platforms functionality and able to change user roles.
   <a id = "3"> </a>

## Features found on the platform

- Users/guests should be able to view all items.
- Guests should be able to sign up.
- Admins should be able to change user roles.
- Users/Vendors/Admins should be able to log in.
- Users should be able to manage their cart.
- Users should be able to buy items from the platform.
- Users should be able to rate the platform/specific vendors.
- Guests should be able to send questions or queries using a contact form provided on the site.
- Vendors should be able to fully manage their stock.
- Users should be able to effect payments/checkout.
- Online payment with a credit/debit card.
- Mobile money payments.
- On delivery payments. - Across the counter payments.

<a id = "4"> </a>

## Tech Stack

- **Node.js:** Backend environment for server-side logic.
- **Express.js:** Web application framework for Node.js.
- **PostgreSQL:** Relational database management system.
- **Typescript:** Supercript of JavaScript used as for back-end programming.

<a id = "5"> </a>

## Installation

Being able to access the e-commerce-mavericcks-bn backe-end:

1.  Clone the repository

    - Using HTTPS :

    ```
    git clone https://github.com/atlp-rwanda/e-commerce-mavericcks-bn.git
    cd e-commerce-mavericcks-bn
    ```

    - Using SSH :

    ```
    git clone git@github.com:atlp-rwanda/e-commerce-mavericcks-bn.git
    cd e-commerce-mavericcks-bn
    ```

2.  Installing depedencies:

`npm install`

3.  Copy the environment configuration:

`cp .env.example .env`

Update the values of `.env` file with your configurations

<a id = "6"> </a>

## Pivotal Tracker with GitHub Best Practices

[Pivotal Tracker's Docs](https://www.pivotaltracker.com/help/articles/github_integration/#attaching-branches-to-a-story-automatically)

Welcome! This document will guide you through the best practices for ensuring that your work is available in Pivotal Tracker and matches the provided tasks.

## Naming Conventions

### Branches

When creating a branch, include the story ID in the branch name to automatically attach it to the story in Tracker.

**Best Practices for Branch Names:**

1. No uppercase letters; use hyphens instead of spaces.
2. Start with the Pivotal Tracker story ID (if connecting to a specific story).
3. Use prefixes:

- `ch` for chores.
- `fit` for features.
- `bg-fix` for bug fixes.

4. Keep names short and consistent with the feature you're working on.

### Commits

Follow these practices for commit messages:

1. Start with a verb in the imperative mood describing the change.
2. Keep the subject line concise (under 50 characters).
3. Explain the reason for the change, not just the mechanics.
4. Aim for single, logical changes per commit.
5. Capitalize the first letter of the subject line and any following words.

Example commit message: `git commit -m "[finishes #123123] Updated settings for holograph projector"`

### Pull Requests

Attach pull requests to stories automatically by starting the branch name with the story's ID.

<a id = "7"> </a>

## Setting up Swagger Documentations

If setting up Swagger for the first time, follow these steps:

1. Navigate to the location `src/docs`.
2. Create a `.yaml` file.
3. Write your documentation in the file.
4. No need to set up Swagger-related things in `server.ts` again.

**Note:** YAML strictly follows indentations, so ensure you follow them.

# Sequelize Usage Guide

## Introduction

This documentation provides guidance on setting up and using Sequelize in the project. Sequelize is a promise-based Node.js ORM for PostgreSQL, MySQL, SQLite, and MSSQL databases.

## Setup

1. _Run Existing Migrations:_ Execute existing migrations to create database tables.

    ```
   npm run migrate
   ```

## Usage

### Running Migrations

- _Create Tables:_ To create database tables based on existing migrations.

  ```
  npm run migrate
  ```

- _Undo Changes:_ If you need to rollback changes made by migrations.

    ```
    npm run migrate:undo
    ```
### Seeding Data

- _Seed Database:_ Add initial data to the database.
  ```
  npm run seed
  ```
 
- _Undo Seeding:_ Remove seeded data from the database.
  
    ```
    npm run seed:undo
    ```

### Creating Models

- _Generate Model:_ Create a new model using the Sequelize CLI.
 
  ```
  npx sequelize-cli model:generate --name <ModelName> --attributes <attr1>:<type>,<attr2>:<type>,...
  ```

### Generating Migrations

- _Generate Migration:_ Generate a new migration file for making changes to the database schema.
     ```
      npx sequelize-cli migration:generate --name <MigrationName>
     ```

### Executing Migrations

- _Run Migrations:_ Execute the generated migration to apply changes to the database.
  ```
  npm run migrate
  ```

## Conclusion

Sequelize simplifies database interactions in the project by providing an ORM layer. Follow the steps outlined above to set up Sequelize and manage database schema changes effectively. For more information, refer to the Sequelize documentation.


## Useful Links

1. [Pivotal Tracker's Official Documentation](https://www.pivotaltracker.com/help/articles/github_integration/#attaching-branches-to-a-story-automatically)
2. [freeCodeCamp Article on Naming Commits](https://www.freecodecamp.org/news/writing-good-commit-messages-a-practical-guide/)
3. [Medium Article on Naming Branches](https://medium.com/@abhay.pixolo/naming-conventions-for-git-chores-a-cheatsheet)
