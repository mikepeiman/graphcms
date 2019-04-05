// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here requires a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: "MikePeiman.com",
  siteUrl: "https://mikepeiman.com",
  siteDescription: "Father, Web Developer, Entrepreneur, Natural Philosopher. Learning and teaching how to live better lives and build a better world.",
  icon: "src/assets/LifeIQ.svg",
  plugins: [
    {
      use: "@gridsome/source-faker",
      options: {
        numNodes: 50
      }
    },
    {
      use: "@gridsome/source-filesystem",
      options: {
        path: "blog/**/*.md",
        typeName: "Post",
        route: "/blog/:slug",
        resolveAbsolutePaths: true,
        remark: {
          autolinkClassName: "fas fa-hashtag",
          externalLinksTarget: "_blank",
          externalLinksRel: ["nofollow", "noopener", "noreferrer"],
          plugins: [["gridsome-plugin-remark-shiki", { theme: "nord" }]]
        }
      }
    },
    {
      use: "@gridsome/plugin-google-analytics",
      options: {
        id: "UA-xxx"
      }
    },
    {
      use: "~/src/sources/products",
      options: {
        // typeName: "Airtable",
        apiKey: "keyoLbEc7OzfEfj68",
        base: "app0QClDCzUUtEYAk"
      }
    },
    {
      use: "~/src/sources/swapi",
    },
    {
      use: "~/src/sources/strapi",
    },
    {
      use: "~/src/sources/blogpost",
    },
    {
      use: "~/src/sources/graphcms",
    },
    // {
    //   use: "~/src/sources/localdota",
    // },
    // {
    //   use: "~/src/sources/dota2",
    //   options: {
    //     numNodes: 120,
    //     perPage: 120
    //   }
    // },
    {
      use: "~/src/sources/heroes",
      options: {
        numNodes: 120,
        perPage: 120
      }
    },
  ]
};
