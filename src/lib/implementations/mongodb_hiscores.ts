import { Implementation, type Hiscores } from "$lib/do_not_modify/hiscores";
import { JumpPlayer } from "$lib/do_not_modify/player";
import { DefaultRank, type Rank } from "$lib/do_not_modify/rank";
import type {
  GetLeaderboardsRequest,
  GetLeaderboardsResponse,
  CreateLeaderboardRequest,
  CreateLeaderboardResponse,
  DeleteLeaderboardRequest,
  DeleteLeaderboardResponse,
  GetScoresRequest,
  GetScoresResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
  GetRanksForPlayerRequest,
  GetRanksForPlayerResponse,
} from "$lib/do_not_modify/requests";
import { JumpScore, type Score } from "$lib/do_not_modify/score";
import * as database from "$lib/database";
import type { Leaderboard } from "$lib/do_not_modify/leaderboard";

export class MongoDBHiscores implements Hiscores {
  implementation: Implementation = Implementation.MONGODB;

  async get_leaderboards(
    request: GetLeaderboardsRequest
  ): Promise<GetLeaderboardsResponse> {
    // TODO: implement logic

    let client = await database.connectMongoDB();

    let result = client
      .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
      .find({});

    let leaderboards: string[] = [];

    (await result.toArray()).forEach(
      (e: Leaderboard & { saveManyScore: boolean }) => leaderboards.push(e.id)
    );

    const response: GetLeaderboardsResponse = {
      success: leaderboards.length > 0 ? true : false,
      leaderboards,
    };

    return response;
  }
  async create_leaderboard(
    request: CreateLeaderboardRequest
  ): Promise<CreateLeaderboardResponse> {
    let client = await database.connectMongoDB();

    let result = await client
      .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
      .insertOne({
        id: request.leaderboard_id,
        scores: [],
        saveManyScore: request.save_multiple_scores_per_player,
      });

    let response: CreateLeaderboardResponse = {
      success: false,
    };

    if (result.acknowledged) {
      response = {
        success: true,
      };
    }
    return response;
  }
  async delete_leaderboard(
    request: DeleteLeaderboardRequest
  ): Promise<DeleteLeaderboardResponse> {
    let client = await database.connectMongoDB();

    let result = await client
      .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
      .deleteMany({ id: request.leaderboard_id });

    let response: DeleteLeaderboardResponse = {
      success: false,
    };

    if (result.acknowledged && result.deletedCount > 0) {
      response = {
        success: true,
      };
    }

    return response;
  }
  async get_scores_from_leaderboard(
    request: GetScoresRequest
  ): Promise<GetScoresResponse> {
    // TODO: implement logic

  
    let client = await database.connectMongoDB();

    let result = await client
      .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
      .findOne({
        id: request.leaderboard_id,
      });

    let scores: Score[] = [];

    if (result) scores = result.scores;

    const response: GetScoresResponse = {
      success: result ? true : false,
      scores,
    };

    return response;
  }
  async submit_score_to_leaderboard(
    request: SubmitScoreRequest
  ): Promise<SubmitScoreResponse> {
    // TODO: implement logic

    const client = await database.connectMongoDB();

    let response: SubmitScoreResponse = {
      success: false,
      rank: new DefaultRank(
        -1,
        request.leaderboard_id,
        new JumpScore(1337, request.score.date, request.score.player)
      ),
    };

    let index2 = 0;

    let SMS: (Leaderboard & { saveManyScore: boolean }) | null = await client
      .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
      .findOne<Leaderboard & { saveManyScore: boolean }>({
        id: request.leaderboard_id,
      });


    if (SMS) {
      index2 = -1;
      let found: { status: boolean; index: number } = {
        status: false,
        index: 0,
      };

      let index = 0;
      let added: boolean = false;

      do {
        const e: Score | undefined = SMS.scores.at(index);
        if (e != undefined) {
          if (e.player.id == request.score.player.id) {
            found = {
              status: true,
              index: index,
            };
            break;
          }
        } else {
          let result = await client
            .collection<Leaderboard & { saveManyScore: boolean }>(
              "leaderboards"
            )
            .updateOne(
              { id: request.leaderboard_id },
              {
                $push: {
                  scores: {
                    $each: [
                      {
                        value: request.score.value,
                        player: request.score.player,
                        date: request.score.date,
                      },
                    ],
                    $sort: { value: -1 },
                  },
                },
              }
            );

          if (!result.acknowledged) {
            return response;
          }

          index2 = index;
          added = true;
          break;
        }
        index++;
      } while (index < SMS.scores.length);

      let inserted = false;

      let i = 0;

      for (const score of SMS.scores) {
        if (added) {
          break;
        }

        if (!found.status) {
          if (score.value < request.score.value) {
            inserted = true;

            SMS.scores.splice(i, 0, request.score);

            let result = await client
              .collection<Leaderboard & { saveManyScore: boolean }>(
                "leaderboards"
              )
              .updateOne(
                { id: request.leaderboard_id },
                {
                  $push: {
                    scores: {
                      $each: [
                        {
                          value: request.score.value,
                          player: request.score.player,
                          date: request.score.date,
                        },
                      ],
                      $sort: { value: -1 },
                    },
                  },
                }
              );

            index2 = i;
            break;
          }
        } else {
          if (SMS.saveManyScore) {
            if (score.value < request.score.value) {
              inserted = true;
              let result = await client
                .collection<Leaderboard & { saveManyScore: boolean }>(
                  "leaderboards"
                )
                .updateOne(
                  { id: request.leaderboard_id },
                  {
                    $push: {
                      scores: {
                        $each: [
                          {
                            value: request.score.value,
                            player: request.score.player,
                            date: request.score.date,
                          },
                        ],
                        $sort: { value: -1 },
                      },
                    },
                  }
                );
              index2 = i;
              break;
            }
          }
        }
        i++;
      }

      if (!inserted && !added) {
        let result = await client
          .collection<Leaderboard & { saveManyScore: boolean }>("leaderboards")
          .updateOne(
            { id: request.leaderboard_id },
            {
              $push: {
                scores: {
                  $each: [
                    {
                      value: request.score.value,
                      player: request.score.player,
                      date: request.score.date,
                    },
                  ],
                  $sort: { value: -1 },
                },
              },
            }
          );

        index2 = SMS.scores.length;
      }
    }

    response = {
      success: true,
      rank: new DefaultRank(
        index2, 
        request.leaderboard_id,
        new JumpScore(
          request.score.value,
          request.score.date,
          request.score.player
        )
      ),
    };

    return response;
  }
  async get_all_ranks_for_player(
    request: GetRanksForPlayerRequest
  ): Promise<GetRanksForPlayerResponse> {
    const client = await database.connectMongoDB();

    let result = await client
      .collection<Leaderboard>("leaderboards")
      .find<Leaderboard>({});

    let resultArr = await result.toArray();
    let mapLeaderboard: Map<string, Leaderboard> = new Map();

    resultArr.map((e) => {
      mapLeaderboard.set(e.id, e);
    });


    let ranks: Rank[] = [];

    for (const Leaderboard of mapLeaderboard.entries()) {
      for (const score of Leaderboard[1].scores) {
        if (score.player.id == request.player_id) {
          const prep: Rank = {
            index: Leaderboard[1].scores.findIndex(
              (value) => value.value == score.value
            ),
            leaderboard_id: Leaderboard[0],
            score: score,
          };

          ranks.unshift(prep);
        }
      }
    }

    const response: GetRanksForPlayerResponse = {
      success: true,
      ranks,
    };

    return response;
  }
}
