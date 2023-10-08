const express = require("express")
const axios = require("axios")
const _ = require("lodash")

const app = express()
const port = 3000

// Wrappping the analytics function with memoize to cache results
const getBlogStats = _.memoize(
  async () => {
    try {
      const response = await axios.get(
        "https://intent-kit-16.hasura.app/api/rest/blogs",
        {
          headers: {
            "x-hasura-admin-secret":
              "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
          },
        }
      )

      const blogs = response.data

      // Calculating the total number of blogs
      const totalBlogs = blogs.length

      // Finding the blog with the longest title
      const longestBlog = _.maxBy(blogs, "title.length").title

      // Determining the number of blogs with titles containing the word "privacy"
      const privacyBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes("privacy")
      ).length

      // Creating an array of unique blog titles
      const uniqueTitles = _.uniqBy(blogs, "title").map((blog) => blog.title)

      return {
        totalBlogs,
        longestBlog,
        privacyBlogs,
        uniqueTitles,
      }
    } catch (error) {
      throw new Error("Error fetching and analyzing data")
    }
  },
  () => {
    // Setting a custom cache key or cache all results
    return "blogStats"
  }
)

// Middleware to fetch blog data
app.get("/api/blog-stats", async (req, res) => {
  try {
    const blogStats = await getBlogStats()
    res.json(blogStats)
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal server error" })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
