import {defineField,defineType} from "sanity";
export const seo=defineType({
 name:"seo",title:"SEO",type:"object",
 fields:[
  defineField({name:"title",type:"string",validation:r=>r.max(60)}),
  defineField({name:"description",type:"text",rows:3,validation:r=>r.max(160)}),
  defineField({name:"image",type:"image",options:{hotspot:true}})
 ]
});
