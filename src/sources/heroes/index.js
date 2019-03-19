const {
  GraphQLSchema,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  buildSchema,
  printSchema,
  GraphQLObjectType
} = require("graphql");

const $ = require("cheerio");
const rp = require("request-promise");
const heroParse = require("../dota2/heroParse");
const heroesUrl = "http://www.dota2.com/heroes/";

module.exports = function(api) {
  api.loadSource(async store => {
    const Heroes = store.addContentType({
      typeName: "Heroes",
      route: "/heroes/:name"
    });
    const Abilities = store.addContentType({
      typeName: "Abilities",
      route: "/heroes/:hero/:name"
      // path: "/heroes/:hero/:name"
    });
    const AbilityType = new GraphQLObjectType({
      name: 'Ability',
      description: 'An ability of a hero',
      fields: () => ({
        name: {
          type: GraphQLString,
          resolve: ability => ability.name
        },
        src: {
          type: GraphQLString,
          resolve: ability => ability.src
        },
        desc: {
          type: GraphQLString,
          resolve: ability => ability.desc
        },
        path: {
          type: GraphQLString,
          resolve: ability => ability.path
        },
        hero: {
          type: GraphQLString,
          resolve: ability => ability.hero
        },
      })
    })

    Abilities.addSchemaField("name", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.name;
      }
    }));
    Abilities.addSchemaField("src", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.src;
      }
    }));
    Abilities.addSchemaField("desc", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.desc;
      }
    }));
    Abilities.addSchemaField("hero", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.hero;
      }
    }));
    Abilities.addSchemaField("path", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.path;
      }
    }));
    

    Heroes.addSchemaField("name", ({ graphql }) => ({
      type: graphql.GraphQLString,
      allowNull: false,
      resolve(node) {
        return node.fields.name;
      }
    }));
    Heroes.addSchemaField("num", ({ graphql }) => ({
      type: graphql.GraphQLInt,
      allowNull: false,
      resolve(node) {
        return node.fields.num;
      }
    }));
    Heroes.addSchemaField("url", ({ graphql }) => ({
      type: graphql.GraphQLString,
      resolve(node) {
        return node.fields.url;
      }
    }));
    Heroes.addSchemaField("heroImgSrc", ({ graphql }) => ({
      type: graphql.GraphQLString,
      resolve(node) {
        return node.fields.heroImgSrc;
      }
    }));
    Heroes.addSchemaField("abilities", ({ graphql }) => ({
      type: graphql.GraphQLList(AbilityType),
      resolve(node) {
        return node.fields.abilities;
      }
    }));

    rp(heroesUrl)
      .then(html => {
        let heroesList = [];
        
        const listLength = $(".heroIcons > a", html).length;
        // console.log("heros list length: ", listLength);

        // here we have scraped the main heroes page to determine number of heroes
        // then we loop through using a simple for-loop to store name, url, and image src
        // we push these into an array [heroesList] of hero objects

        for (let i = 0; i < listLength; i++) {
          let heroUrl = $(".heroIcons > a", html)[i].attribs.href;
          // console.log('heros Urls: ', i + ': ' + $(".heroIcons > a", html)[i].attribs.href)
          let heroImgSrc = $(".heroHoverLarge", html)[i].attribs.src;
          // console.log('heroImgSrc: ', $('.heroHoverLarge', html)[i].attribs.src)
          let name = $(".heroIcons > a", html)[i].attribs.href.split("/")[4];
          let heroNum = i;
          // console.log('heroNum: ', heroNum)
          let splitName = name.split("_");
          function titleCase(str) {
            return splitName
              .map(word => {
                let newWord = word.charAt(0).toUpperCase() + word.slice(1);
                return newWord;
              })
              .join(" ");
          }
          let heroName = titleCase(splitName);
          heroesList.push({
            num: heroNum,
            name: heroName,
            url: heroUrl,
            heroImgSrc: heroImgSrc
          });
        }

        // now we take the complete heroes list scraped from the main page, and we map through it
        // invoking the heroParse() function, which returns more details for each hero (like abilities) 

        return Promise.all(
          heroesList.map(hero => {
            return heroParse(hero.num, hero.name, hero.url, hero.heroImgSrc);
          })
        )
      })
      .then(async heroes => {
        heroes.forEach(hero => {

          // Now we add each hero node to the GraphQL schema
          // Note that 'abilities' is an array of objects containing ability name, src, and other
          // attributes

          Heroes.addNode({
            title: hero.name,
            fields: {
              num: hero.num,
              name: hero.name,
              abilities: hero.abilities,
              heroImgSrc: hero.heroImgSrc
            }
          });
          hero.abilities.forEach(ability => {
            Abilities.addNode({
              title: ability.name,
              path: ability.path,             
              fields: {
                src: ability.src,
                name: ability.name,
                desc: ability.desc,
                hero: hero.name
              }
            })
            // console.log(`hero.abilities.forEach: hero.name ${hero.name}`) 
          })
        });
      })
      .catch(err => {
        console.log("error! ", err);
      });
  });
};
