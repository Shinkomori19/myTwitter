<!--This is APIDOC.md for YIPPER. Explains four endpoints of the API.-->

# YIPPER API Documentation
YIPPER API provides data of posted yips.The goal of this API is to make it possible for
 users to interact with database stored in server through client-side.


#### Gets all existing yips data or data matching a given term

**Request Format:** `/yipper/yips` endpoint with optional query parameter of `search`

**Request Type (both requests):** `GET`

**Returned Data Format:** JSON

**Description 1:** If `search` parameter is not included in the request, it gets the `id`, `name`, `yip`, `hashtag`, `likes` and `date` from the `yips` table of database and outputs JSON containing the information in the order of `date`s in descending order.

**Example Request 1:** `/yipper/yips`

**Example Output 1:** (abbreviated using "..." symbols)
```json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}
```

**Description 2:** If the `search` parameter is included in the request, it responds with all the `id`s of the `yip`s matching the term passed in the `search` query parameter (ordered by the `id`s). A "match" means that `yip` has the `search` term in any position.

**Example Request 2:** `/yipper/yips?search=if`

**Example Output 2:**
```json
{
  "yips" : [
    {
      "id": 8
    },
    {
      "id": 24
    }
  ]
}
```

**Error Handling:**
- Possible 500 server errors (in plain text):
  - If something goes wrong in server side, an error is returned with the message: `An error occurred on the server. Try again later.`


#### Gets yip data for a given user

**Request Format:** `/yipper/user/:user` endpoint without query parameters.

**Request Type:** `GET`

**Returned Data Format:** JSON

**Description:** It gets the `name`, `yip`, `hashtag` and `date` for all the yips for a
given `user`, and returns it in descending order by the `date`.

**Example Request:** `/yipper/user/Chewbarka`

**Example Output:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (in plain text):
  - If given path parameter(user) does not exist in database, an error is returned with the message: `Yikes. User does not exist.`
- Possible 500 server errors (in plain text):
  - If something goes wrong in server side, an error is returned with the message: `An error occurred on the server. Try again later.`


#### Updates the likes for a given yip

**Request Format:** `/yipper/likes` endpoint with body parameters of `id`

**Request Type:** `POST`

**Returned Data Format:** plain text

**Description:** It updates the `likes` for a yip that has the `id` passed through the body by
incrementing the current value by 1 and responding with the new value.

**Example Request:** `/yipper/likes`

**Example Output:**
```
8
```

**Error Handling:**
- Possible 400 (invalid request) errors (in plain text):
  - If missing the parameter `id`, an error is returned with the message: `Missing one or more of the required params.`
  - If given `id` does not exist in the database, an error is returned with the message: `Yikes. ID does not exist.`
- Possible 500 server errors (in plain text):
  - If something goes wrong in server side, an error is returned with the message: `An error occurred on the server. Try again later.`


#### Adds a new yip

**Request Format:** `/yipper/new` endpoint with body parameters of `name` and `full`

**Request Type:** `POST`

**Returned Data Format:** JSON

**Description:** It adds the new Yip information to the database and sends back and output
JSON with the  `id`, `name`, `yip`, `hashtag`, `likes` and `date` of the newly added yip.
The initial value of `likes` is 0, and `date` is the current date.

**Example Request:** `/yipper/new`

**Example Output:**
```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (in plain text):
  - If missing the parameter `name` or the parameter `full`, an error is returned with the message: `Missing one or more of the required params.`
  - If given path parameter `name` does not exist in database, then an error is returned with the message:  `Yikes. User does not exist.`
- Possible 500 server errors (in plain text):
  - If something goes wrong in server side, an error is returned with the message: `An error occurred on the server. Try again later.`