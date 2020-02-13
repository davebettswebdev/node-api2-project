const Posts = require('../data/db');
const router = require('express').Router();

router.get('/', (req, res) => {
  Posts.find()
    .then( posts => {
      res.status(200).json(posts)
    })
    .catch( error => {
      console.log(error)
      res.status(500).json({
        error: 'Unable to retrieve posts.'
      });
    });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  Posts.findById(id)
    .then( post => {
      if (post.length > 0) {
        res.status(200).json(post);
      } else {
        res.status(400).json({
          errorMessage: 'The post with the specified ID does not exist.'
        });
      }
    })
    .catch( error => {
      console.log(error);
      res.status(500).json({
        error: 'Error retrieving the post.'
      });
    });
});

router.get('/:id/comments', (req, res) => {
  const id = req.params.id;
  Posts.findById(id)
    .then( post => {
      if (post.length > 0) {
        Posts.findPostComments(id)
        .then( comments => {
          if (comments.length > 0) {
            res.status(200).json(comments);
          } else {
            res.status(404).json( {
              message: 'That post does not have any comments' 
            });
          }
        })
        .catch( error => {
          console.log(error);
          res.status(500).json({
            error: 'Error retrieiving post comments.'
          });
        });
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist'
        });
      }
    })
});

router.post('/', (req, res) => {
    const { title, contents } = req.body;
    Posts.insert(req.body)
     .then(post => {
         if (!title || !contents){
             res.status(400).json({
                 errorMessage:'Please provide title and contents for the post.'
             })
         } else {
             res.status(201).json(post);
         }
     })
     .catch(error => {
         console.log(error);
         res.status(500).json({
             error: 'There was an error while saving the post to the database'
         });
     });
});

router.post('/:id/comments', (req, res) => {
    const id = req.params.id;
    if (!req.body.text) {
      res.status(400).json({
        errorMessage: 'Gotta have some text in that comment, bro.'
      })
    } else {
      Posts.findById(id)
        .then( post => {
          if(post.length > 0) {
            const comment = {
              text: req.body.text,
              post_id: req.params.id
            };
            Posts.insertComment(comment)
              .then( id => {
                res.status(201).json(id);
              })
              .catch( error => {
                res.status(500).json({
                  error: 'Error saving comment to database.'
                });
              });
          } else {
            res.status(404).json({
              message: 'The post with the specified ID doesn\'t exist.'
            });
          }
      })
    }
  });

router.put("/:id", (req, res) => {
    const id = req.params.id;
    const user = req.body;
    const { title, contents } = user;
    if (!title || !contents) {
      res.status(400).json({
        errorMessage: "Please provide title and contents for the post."
      });
    }
    Posts.update(id, user)
      .then(post => {
        if (!post) {
          res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
        } else {
          res.status(200).json({
            message: "The post information was updated successfully"
          });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          errorMessage: "The post information could not be modified."
        });
      });
  });
  
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    Posts.remove(id)
      .then(post => {
        if (post) {
          res.status(200).json(post);
        } else {
          res.status(404).json({
            message: "The post with the specified ID does not exist."
          });
        }
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({
          errorMessage: "The user could not be removed"
        });
      });
  });

module.exports = router;